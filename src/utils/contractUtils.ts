
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
// Import PDFDocument directly without EventEmitter dependency
// We'll use it as a class/constructor
const PDFDocument = require('pdfkit');

// Template content placeholders mapping
const placeholders = {
  companyname: 'company_name',
  organizationnumber: 'organization_number',
  address: 'address',
  zipcode: 'postal_code',
  city: 'city',
  country: 'country',
  contactfullname: 'contact_full_name',
  contactposition: 'contact_position',
  todaydate: 'today_date',
  mrrprice: 'mrr_price'
};

// Get contract template based on type
export const getContractTemplate = (templateType: string): string => {
  switch(templateType) {
    case 'dpa':
      return templates.dpa;
    case 'nda':
      return templates.nda;
    case 'web':
      return templates.web;
    case 'marketing':
      return templates.marketing;
    default:
      return 'Template not found';
  }
};

// Fill contract template with data
export const fillContractTemplate = async (contract: any): Promise<string> => {
  try {
    if (!contract) return 'Contract not found';
    
    // Get the template
    const templateContent = getContractTemplate(contract.template_type);
    
    // Get company data
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', contract.company_id)
      .single();
      
    if (companyError) throw companyError;
    
    // Get contact data
    const { data: contactData, error: contactError } = await supabase
      .from('company_contacts')
      .select(`
        *,
        user:user_id (
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .eq('id', contract.contact_id)
      .single();
      
    if (contactError) throw contactError;
    
    // Prepare replacement data
    let contactFirstName = '';
    let contactLastName = '';
    
    // Safety check to avoid errors with profiles
    if (contactData?.user && 
        typeof contactData.user === 'object' && 
        'profiles' in contactData.user && 
        Array.isArray(contactData.user.profiles) && 
        contactData.user.profiles.length > 0) {
      contactFirstName = contactData.user.profiles[0].first_name || '';
      contactLastName = contactData.user.profiles[0].last_name || '';
    }
    
    const replacementData: Record<string, string> = {
      company_name: companyData?.name || '',
      organization_number: companyData?.organization_number || '',
      address: companyData?.street_address || companyData?.address || '',
      postal_code: companyData?.postal_code || '',
      city: companyData?.city || '',
      country: companyData?.country || '',
      contact_full_name: `${contactFirstName} ${contactLastName}`.trim(),
      contact_position: contactData?.position || '',
      today_date: format(new Date(), 'yyyy-MM-dd'),
      mrr_price: companyData?.mrr ? `${companyData.mrr} NOK` : 'N/A'
    };
    
    // Replace placeholders
    let filledTemplate = templateContent;
    Object.entries(placeholders).forEach(([placeholder, key]) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      filledTemplate = filledTemplate.replace(regex, replacementData[key] || '');
    });
    
    return filledTemplate;
  } catch (error) {
    console.error("Error filling contract template:", error);
    return 'Error generating contract content';
  }
};

// Generate PDF from contract
export const generateContractPDF = async (contract: any): Promise<void> => {
  try {
    // Get filled contract content
    const contractContent = await fillContractTemplate(contract);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Convert to blob
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.template_type}-contract-${format(new Date(), 'yyyyMMdd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    // Add content to PDF
    const companyName = contract.companies?.name || 'Company';
    doc.fontSize(20).text(`${getTemplateTypeName(contract.template_type)} - ${companyName}`, {
      align: 'center'
    });
    doc.moveDown(2);
    
    // Add contract content with proper formatting
    const paragraphs = contractContent.split('\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim() === '') {
        doc.moveDown();
      } else {
        doc.fontSize(12).text(paragraph);
      }
    });
    
    // Add signature information if signed
    if (contract.status === 'signed' && contract.signed_at) {
      doc.moveDown(2);
      doc.fontSize(14).text('Signed Contract', { underline: true });
      doc.moveDown();
      
      // Get contact name - safely handle potentially missing data
      let contactFullName = '';
      if (contract.contacts && 
          typeof contract.contacts === 'object' && 
          contract.contacts.user && 
          typeof contract.contacts.user === 'object' && 
          'profiles' in contract.contacts.user && 
          Array.isArray(contract.contacts.user.profiles) && 
          contract.contacts.user.profiles.length > 0) {
        const contactFirstName = contract.contacts.user.profiles[0].first_name || '';
        const contactLastName = contract.contacts.user.profiles[0].last_name || '';
        contactFullName = `${contactFirstName} ${contactLastName}`.trim();
      }
      
      doc.fontSize(12).text(`Signed by: ${contactFullName}`);
      doc.text(`Signed date: ${format(new Date(contract.signed_at), 'yyyy-MM-dd')}`);
      
      // Add signature image if available
      if (contract.signature_data) {
        doc.moveDown();
        doc.text('Signature:');
        doc.moveDown(0.5);
        // Convert base64 to image for PDF
        try {
          const signatureData = contract.signature_data.replace(/^data:image\/\w+;base64,/, '');
          // Fix image options format
          doc.image(Buffer.from(signatureData, 'base64'), { 
            width: 200,
            align: 'left'
          });
        } catch (error) {
          console.error("Error adding signature to PDF:", error);
          doc.text("(Signature unavailable)");
        }
      }
    }
    
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Get template type name
export const getTemplateTypeName = (type: string): string => {
  switch (type) {
    case 'dpa':
      return 'DPA (Data Processing Agreement)';
    case 'nda':
      return 'NDA (Non-Disclosure Agreement)';
    case 'marketing':
      return 'Marketing';
    case 'web':
      return 'Web Development';
    default:
      return type;
  }
};

// Contract templates
const templates = {
  dpa: `Databehandleravtale
Denne databehandleravtalen ("Avtalen") er inngått mellom:
Behandlingsansvarlig: {{companyname}}, org.nr {{organizationnumber}} {{address}}, {{zipcode}} {{city}}, {{country}}

Databehandler:  Box Marketing AS, org.nr 920 441 882  Skiftesvikvegen 101, 5302 Strusshamn, Norge
Avtalen er inngått som del av det etablerte kundeforholdet og er et tillegg til samarbeidsavtalen mellom partene om levering av digitale markedsføringstjenester, nettside- og nettbutikkløsninger, teknisk implementering og automatisering.



1. Formål og behandlingsgrunnlag
Databehandleren behandler personopplysninger på vegne av Behandlingsansvarlig i forbindelse med levering av tjenester innen digital markedsføring, analyse, konverteringsoptimalisering, utvikling og drift av nettsider/nettbutikker, CRM-integrasjoner, e-postutsendelser og automatiserte prosesser.
Behandlingen skjer kun etter dokumentert instruks fra Behandlingsansvarlig og i den grad det er nødvendig for å oppfylle avtalt leveranse.



2. Behandlingens art og varighet
Behandlingen omfatter innsamling, registrering, strukturering, analyse, lagring, overføring og sletting av personopplysninger.  Behandlingen skjer i den perioden det eksisterer et aktivt kundeforhold og avsluttes ved avtalens opphør, med mindre videre oppbevaring kreves ved lov.



3. Typer personopplysninger som behandles
Databehandleren kan behandle følgende kategorier av personopplysninger:
* Navn 
* E-postadresse 
* Telefonnummer 
* IP-adresse og enhetsdata 
* Adresse/poststed 
* Brukeratferd på nettside og i applikasjoner 
* Kunderelaterte data (kjøpshistorikk, preferanser, segmentering) 
* Betalingsopplysninger (når relevant og etter instruks) 
* Personnummer (kun ved uttrykkelig behov, f.eks. for identifikasjon eller kredittsjekk)  
4. Registrerte personer
Behandlingen omfatter personopplysninger om Behandlingsansvarligs kunder, potensielle kunder (leads), sluttbrukere eller andre registrerte som naturlig omfattes av tjenestene.

5. Informasjonssikkerhet
Databehandleren skal iverksette hensiktsmessige tekniske og organisatoriske tiltak for å sikre konfidensialitet, integritet og tilgjengelighet av personopplysninger.
Tiltak inkluderer blant annet:
* Kryptering ved overføring av data 
* Tilgangsstyring, tilgangsbegrensning og autentisering (inkludert tofaktorautentisering) 
* Logging av tilganger og relevante hendelser 
* Lagring på sikre servere med regelmessig sikkerhetskopiering 
* Intern opplæring og taushetsplikt for involvert personell 
Tiltakene skal vurderes og oppdateres regelmessig i lys av utviklingen i teknologi, risiko og gjeldende regelverk.

6. Bruk av underdatabehandlere
Databehandleren kan benytte seg av underdatabehandlere for teknisk infrastruktur, drift, analyse, utvikling og distribusjon av tjenester.
Bruken av slike underdatabehandlere vil variere fra kunde til kunde, og tilpasses det konkrete kundeforhold og tjenesteleveranse. Underleverandører som potensielt benyttes inkluderer, men er ikke begrenset til:

* Leverandører av markedsførings- og annonseplattformer (Google, Meta, LinkedIn, TikTok, Snapchat, Bing) 
* Plattformleverandører for web og nettbutikk (WordPress, WooCommerce, Shopify, Wix, SquareSpace) 
* CRM- og nyhetsbrevtjenester (HubSpot, Mailchimp, Klaviyo) 
* Verktøy for analyse og sporing (Google Analytics, Tag Manager, Hotjar, etc.) 
Behandlingsansvarlig gir med dette et generelt forhåndssamtykke til bruk av nødvendige og relevante underdatabehandlere, forutsatt at Databehandleren sørger for at slike underleverandører er bundet av databehandleravtaler som sikrer tilsvarende nivå av personvern og informasjonssikkerhet.
Databehandleren skal på forespørsel gi Behandlingsansvarlig oversikt over de aktuelle underdatabehandlere som benyttes i det enkelte kundeforhold.

7. Overføring til tredjeland
Overføringer til tredjeland utenfor EØS kan finne sted ved bruk av underdatabehandlere. Enhver slik overføring skal skje i samsvar med GDPR kapittel V, basert på gyldige overføringsmekanismer som EU-kommisjonens standardavtalevilkår (SCC) eller annen godkjent rettslig overføringsordning.

8. Bistand til behandlingsansvarlig
Databehandleren skal bistå Behandlingsansvarlig med å oppfylle sine forpliktelser etter personvernregelverket, inkludert ved forespørsler fra registrerte, sikkerhetsbrudd, vurderinger av personvernkonsekvenser og kontakt med tilsynsmyndigheter.

9. Sletting og tilbakelevering
Ved opphør av kundeforholdet skal Databehandleren, etter Behandlingsansvarliges valg, slette eller tilbakelevere alle personopplysninger som er behandlet på vegne av Behandlingsansvarlig, med mindre annen oppbevaring kreves i henhold til gjeldende lovgivning.

10. Kontroll og revisjon
Behandlingsansvarlig har rett til å kreve dokumentasjon på at personopplysningene behandles i samsvar med denne avtalen og gjeldende regelverk. Databehandleren skal etter forespørsel gjøre tilgjengelig relevante rapporter, erklæringer eller annen dokumentasjon.
Behandlingsansvarlig kan, ved begrunnet mistanke om brudd eller behov for særskilt kontroll, gjennomføre eller få gjennomført revisjon i samråd med Databehandleren.

11. Varighet og signatur
Denne avtalen trer i kraft ved signering og gjelder så lenge Databehandleren behandler personopplysninger på vegne av Behandlingsansvarlig.
Dato: {{todaydate}}
For Behandlingsansvarlig:  Navn: {{contactfullname}}  Stilling: {{contactposition}}  Signatur: _________________________

For Databehandler (Box Marketing AS):  Navn: Christoffer Hjelpdahl  Stilling: Partner  Signatur: _________________________`,

  nda: `Fortrolighetsavtale ("NDA")
Denne fortrolighetsavtalen ("Avtalen") er inngått mellom

1. BOX MARKETING AS, med organisasjonsnummer 920441882 og forretningsadresse Skiftesvikvegen 101 5302 STRUSSHAMN Norge; og
2. {{companyname}}, med organisasjonsnummer {{organizationnumber}} og forretningsadresse {{address}}, {{zipcode}} {{city}}, {{country}}
som i Avtalen omtales i fellesskap som "Partene", og hver for seg som en "Part".

Den Parten som deler informasjon omtales som "Informasjonsgiveren" og den Part som mottar informasjon omtales som "Mottakeren".
Begge Parter kan være både Informasjonsgiver og Mottaker.

1. Formål
    1. Partene ønsker å dele Konfidensiell Informasjon (som definert under) i forbindelse med Markedsføringstjenester ("Formålet"), og denne Avtalen angir vilkårene for deling av den Konfidensielle Informasjonen.
    2. Hver Part bekrefter å ha myndighet til å inngå denne Avtalen og dele den Konfidensielle Informasjonen uten å bryte andre avtaler eller forpliktelser.

2. Avtaleperioden
    1. Denne Avtalen løper inntil:

en Part sier opp Avtalen ved skriftlig varsel til den andre Parten på minst 1 måned; eller

￼
  Partene blir skriftlig enige om å ha en tidligere opphørsdato.

2. Informasjon delt etter utløpet av Avtalen vil ikke omfattes av Avtalen.

3. Konfidensialitetsperioden
Mottakerens forpliktelser med hensyn til den Konfidensielle Informasjonen den har mottatt under Avtalen vil fortsette i en periode på 150 år etter at Avtalen er utløpt eller sagt opp.

4. Konfidensiell Informasjonen
    1. "Konfidensiell Informasjon" omfatter:
informasjon delt før Avtalen er signert;
informasjon om Formålet og at Partene er i samtaler om Formålet; og

all informasjon i skriftlig, muntlig eller annen form som mottas fra Informasjonsgiveren uavhengig av om informasjonen er merket eller uttrykt som konfidensiell.
5. Omfanget av informasjonsdeling
    1. Deling av Konfidensiell Informasjon skjer etter Informasjongiverens eget skjønn.
    2. Mottakerens vurdering og bruk av den Konfidensielle Informasjonen skal skje for egen risiko.
    3. Informasjongiveren skal ikke pådra seg noe ansvar som følge av Mottakerens bruk av, eller tillit til, Konfidensiell Informasjon.

6. Eiendomsrett
Partene er enige om at Konfidensiell Informasjon og alt materiale som inneholder eller knytter seg til Konfidensiell Informasjon skal forbli Informasjonsgiverens eiendom.

7. Anvendelse av Konfidensiell Informasjon
    1. Mottakeren skal holde Konfidensiell Informasjon hemmelig og ikke bruke den til annet enn det som er nødvendig i forbindelse med Formålet.
    2. Mottakeren skal ikke kommunisere, selge, handle, publisere, kopiere eller reprodusere Konfidensiell Informasjon, med mindre det er uttrykkelig tillatt etter Avtalen.
    3. Mottakeren skal ta de nødvendige forholdsregler for å forhindre utilsiktet avsløring av Konfidensiell Informasjon.
    4. Mottakeren skal behandle Konfidensiell Informasjon på en forsvarlig måte som hindrer at den blir tilgjengelig for uvedkommende eller at andre får kjennskap til den.
    5. Mottakeren vil varsle Informasjonsgiveren umiddelbart hvis den blir klar over at Konfidensiell Informasjon er blitt avslørt i strid med Avtalen. Mottakeren skal ta de skritt som Informasjonsgiveren med rimelighet krever med hensyn til slike avsløringer. "Representant" betyr styremedlemmer, ledere, ansatte, agenter, rådgivere eller andre representanter for eller tilknyttet en Part.
    6. Ved å inngå Avtalen forplikter Mottakeren seg til å ikke gjøre noe som kan være til ulempe eller skade for Informasjonsgiverens nåværende eller fremtidige rettigheter til den Konfidensielle Informasjonen, inkludert, men ikke begrenset til:

innlevering av patenter eller varemerker eller initiering av andre prosedyrer som registrering av varemerker eller patenter, som er rettet mot å sikre juridiske rettigheter;

gjennomføring av analyser eller utvikling av Konfidensiell Informasjon annet enn med hensyn til Formålet;

bruk av Konfidensiell Informasjonen til å utføre forskning eller studier;

publisering av resultatene av studier utført ved bruk av Konfidensiell Informasjon; og

kommersialisering av ethvert produkt eller tjeneste som involverer bruk av Konfidensiell Informasjon;

reproduksjon av informasjon som er inkludert i den Konfidensiell Informasjon.
8. Unntak fra forpliktelser for Konfidensiell Informasjon
    1. Mottakeren er ikke bundet av forpliktelsene i Avtalen med hensyn til informasjon som den kan påvise faller innenfor en av følgende kategorier:

informasjon som var offentlig tilgjengelig eller som allerede var kjent for Mottakeren da den ble offentliggjort;

informasjon som blir offentliggjort etter at den ble levert til Mottakeren med mindre dette skyldes brudd på Avtalen;

informasjon utviklet uavhengig av Mottakeren uten brudd på Avtalen; eller

informasjon som Mottakeren er pålagt av en domstol eller statlige myndigheter å dele, men bare hvis den før en slik offentliggjøring:

umiddelbart gir melding til Informasjonsgiveren for å gi den muligheten til å forhindre eller begrense den foreslåtte offentliggjøringen, med mindre det er forbudt ved lov eller forskrift å gi slik melding; og

￼
 gir rimelig bistand til Informasjonsgiveren for å forhindre eller begrense den foreslåtte offentliggjøringen.

2. Hvis Informasjonsgiveren krever samtykke fra en tredjepart for å kunne dele Konfidensiell Informasjon, skal den ha rett til, etter eget skjønn, å informere om eksistensen av Avtalen og Formålet til den relevante tredjeparten.

9. Retur av materialer
    1. Informasjonsgiveren kan til enhver tid kreve:

skriftlig og/eller elektronisk informasjon, samt materiale utarbeidet basert på Konfidensiell Informasjon, tilbakelevert, makulert eller slettet;

￼
 at Mottakeren skriftlig erklærer at den har overholdt dette kravet.

10. Begrensninger i Avtalens omfang
Hver av Partene er enige i at verken inngåelsen av Avtalen eller utlevering av Konfidensiell Informasjon betyr eller skal tolkes som om:

en Part er forpliktet til å inngå en avtale i forbindelse med Formålet eller på annen måte;

det er noen form for forventning om en betaling eller kompensasjon;

det er noen form for joint venture, agentforhold eller annen type forhold mellom Partene; eller
￼
  en Part har fullmakt til å forplikte eller binde den andre Parten.

11. Endringer og overføringer
    1. Avtalen kan bare endres ved skriftlig avtale, signert av begge Partene.
    2. Avtalen kan ikke overføres, bortsett fra med samtykke fra den andre Parten.

12. Ansvar
    1. Mottakeren godtar at dens manglende overholdelse av denne Avtalen kan forårsake uopprettelig skade for Informasjonsgiveren som ikke kan kompenseres tilstrekkelig for med økonomisk erstatning. Følgelig skal Informasjonsgiveren ha rett til å pålegge en spesifikk ytelse, eller få et påbud mot Mottakeren.
    2. Disse rettighetene og rettsmidlene kommer i tillegg til retten på erstatning eller andre tilgjengelige rettigheter Informasjonsgiveren har etter loven eller kontrakt.

13. Lovvalg og tvisteløsning
    1. Avtalen skal tolkes i henhold til norsk lov.
    2. Partene er enige om å søke å løse enhver tvist forbundet med Avtalen i minnelighet. Dersom det ikke lykkes å komme frem til en minnelig løsning innen rimelig tid (ikke mer enn 60 kalenderdager), eller hvis Informasjonsgiveren ber om en spesifikk ytelse eller et påbud, er Partene enige om at at saken skal fremsettes for norske domstoler, med Oslo tingrett som avtalt verneting, eller ved krav om en spesifikk ytelse eller et påbud, enhver domstol som aksepterer fremsettelse av saken.

14. Signering
Oslo, 21.03.2025

Avtalen er utstedt i 2 – to – eksemplarer, ett til hver av Partene. For BOX MARKETING AS:
--------------------

Christoffer Hjelpdahl Foundeer / Partner
For {{companyname}}


--------------------

{{contactfullname}} {{contactposition}}`,

  web: `Samarbeidsavtale - Nettside eller nettbutikk
Mellom: 
Box Marketing AS, org.nr. 920 441 882, Skiftesvikvegen 101, 5302 Strusshamn ("Box")  og 
 {{companyname}}, org.nr. {{organizationnumber}}, {{address}}, {{zipcode}} {{city}}, {{country}} ("Kunden")  (kalt samlet "Partene", hver for seg "Part")

1. Omfang og varighet
Box skal bistå Kunden med utvikling og/eller vedlikehold av nettside og nettbutikk, herunder design, struktur, innhold og funksjonalitet – samt andre relevante oppgaver som skriftlig avtales (e-post godtas).
Avtalen gjelder fra signering og løper inntil den sies opp. Det er ingen bindingstid, men én måneds oppsigelsestid, gjeldende fra første dag i påfølgende måned.

2. Arbeidsform og ansvar
Box står fritt til å benytte egne ansatte eller samarbeidspartnere for utførelsen. Alt arbeid utføres profesjonelt og i tråd med lover og avtaler. Box har arbeidsgiveransvar for involvert personell.

3. Vederlag og betaling
Tjenestene faktureres etter medgått tid:
* kr 950 per time for arbeid gjort av norsk team  
* kr 450 per time for arbeid gjort av Box sitt internasjonale team 
Box fører timelogg og fakturerer månedlig. Betalingsfrist: 14 dager. Ved forsinket betaling kan Box stanse leveransen og/eller heve avtalen etter varsel. Forsinkelsesrente iht. lov kommer i tillegg.
Utgifter:  Kunden dekker eventuelle direkte og dokumenterte utlegg dersom dette er avtalt skriftlig på forhånd.

4. Rettigheter og eierskap
Box beholder eierskap og opphavsrett til materiell produsert under oppdraget. Kunden gis en ikke-eksklusiv lisens i 5 år etter full betaling, med mulighet for fornyelse (kr 10.000 per år).
Metodikk, verktøy og generell kompetanse utviklet av Box forblir Box' eiendom.

5. Konfidensialitet
All ikke-offentlig informasjon skal behandles som konfidensiell i to år etter avtalens opphør.

6. Andre oppdrag og underleverandører
Box kan ha andre kunder og bruke underleverandører.  Box kan benytte tredjepart for innkreving av utestående krav.

7. Ansvarsbegrensning
Partenes ansvar er begrenset til dokumenterte direkte tap og maks 100 % av samlet vederlag.  Indirekte tap erstattes ikke. Unntak gjelder brudd på taushetsplikt eller immaterielle rettigheter.

8. Mislighold og heving
Vesentlige brudd gir rett til å heve avtalen umiddelbart etter skriftlig varsel. Heving kan også skje ved grov uaktsomhet, svindel eller alvorlig regelbrudd.

9. Force Majeure
Hendelser utenfor partenes kontroll fritar fra ansvar. Vedvarende hindringer i over to måneder gir rett til oppsigelse med én måneds varsel.

10. Personvern
Box kan behandle personopplysninger knyttet til tjenestene. Ved databehandlerrolle inngås egen databehandleravtale. Kunden er ansvarlig for å sikre behandlingsgrunnlag.

11. Tvisteløsning
Tvister som ikke løses gjennom dialog, avgjøres etter norsk rett med Bergen tingrett som verneting.

12. Signatur
Avtalen trer i kraft ved signering av begge parter.`,

  marketing: `Samarbeidsavtale - Digital markedsføring
Mellom: 
Box Marketing AS, org.nr. 920 441 882, Skiftesvikvegen 101, 5302 Strusshamn ("Box")  og 
 {{companyname}}, org.nr. {{organizationnumber}}, {{address}}, {{zipcode}} {{city}}, {{country}} ("Kunden")  (kalt samlet "Partene", hver for seg "Part")


1. Omfang og varighet
Box skal bistå Kunden med tjenester innen strategi og ledelse samt relaterte aktiviteter som partene løpende avtaler skriftlig (e-post godtas).
Avtalen gjelder fra signering og løper inntil den sies opp. Det er ingen bindingstid, men én måneds oppsigelsestid, gjeldende fra første dag i påfølgende måned.

2. Arbeidsform og ansvar
Box har ansvar for utførelse og kvalitet, og styrer når og hvordan arbeidet gjennomføres. Arbeidet leveres profesjonelt og i tråd med gjeldende lover og avtaler.
Box har arbeidsgiveransvar for alt benyttet personell.

3. Vederlag og betaling
* Din faste månedspris er {{mrrprice}}.
* Box fakturerer månedlig med 14 dagers betalingsfrist.
* Ved forsinket betaling kan Box stanse leveranser og/eller heve avtalen etter varsel.
* Forsinkelsesrente iht. lov og erstatningskrav kan gjøres gjeldende.
Annet: Øvrige kostnader må forhåndsgodkjennes skriftlig. 

4. Rettigheter og eierskap
Kunden beholder alle rettigheter til utviklet materiell.

5. Taushet og konfidensialitet
All ikke-offentlig informasjon skal holdes konfidensiell i to år etter avtalens opphør.

6. Andre oppdrag og underleverandører
Box kan fritt ha andre kunder og bruke underleverandører.
Box kan benytte tredjepart for innkreving av utestående krav.

7. Ansvarsbegrensning
Hver parts ansvar er begrenset til direkte tap og maks 100 % av samlet vederlag.  Indirekte tap erstattes ikke. Unntak gjelder for brudd på taushetsplikt og immaterielle rettigheter.

8. Mislighold og heving
Ved vesentlig mislighold kan avtalen heves med umiddelbar virkning etter skriftlig varsel. Heving kan også skje ved grov uaktsomhet, korrupsjon, svindel eller rettsbrudd.

9. Force Majeure
Partene er ikke ansvarlig for forhold utenfor deres kontroll. Vedvarende hindringer i mer enn to måneder gir rett til oppsigelse med én måneds varsel.

10. Personvern
Box kan behandle personopplysninger for å levere tjenestene. Ved behandling som databehandler skal separat databehandleravtale inngås.

11. Tvisteløsning
Uenigheter søkes løst i minnelighet. Uoppgjorte tvister behandles etter norsk rett med Bergen tingrett som verneting.

12. Signatur
Avtalen trer i kraft ved signering av begge parter.`
};
