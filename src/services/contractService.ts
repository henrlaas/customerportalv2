
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Project } from '@/types/project';

export async function generateProjectContract(project: Project, userId: string) {
  try {
    // Fetch company information
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', project.company_id)
      .single();
    
    if (companyError) throw companyError;

    // Fetch company contact (primary contact preferred)
    const { data: contacts, error: contactsError } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', project.company_id)
      .order('is_primary', { ascending: false });
    
    if (contactsError) throw contactsError;
    
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts found for this company');
    }

    // Select the first contact (will be primary if exists)
    const contact = contacts[0];

    // Generate contract text from template
    let contractText = `Oppdragskontrakt for Box Marketing
1. Partene
 Denne oppdragskontrakten ("Kontrakten") er inngått mellom:
Oppdragsgiver: {{companyname}}, organisasjonsnummer {{organizationnumber}}, adresse {{address}}, {{zipcode}} {{city}}, {{country}}
Oppdragstaker: Box Marketing AS, organisasjonsnummer 920441882, adresse Munkedamsveien 41, 0250 Oslo.
2. Formål
 Formålet med denne Kontrakten er å regulere samarbeidet mellom Partene, herunder de tjenester Oppdragstaker skal levere, samt priser, betalingsbetingelser og andre vilkår.
3. Tjenester
Oppdragstaker skal levere følgende tjenester til Oppdragsgiver (heretter «Oppdraget»):
{{projectdescription}}
{{deadline}}
4. Pris og prisestimat
Pris er basert på estimert antall timer og oppdragets omfang til: {{price}},- eks. mva
Ekstra arbeid faktureres etter medgått tid eller fastpris, etter avtale med Oppdragsgiver.
5. Betalingsbetingelser
Fakturering skjer månedlig etterskuddsvis, med 14 dagers betalingsfrist med mindre annet er avtalt.
Ved forsinket betaling påløper forsinkelsesrenter iht. gjeldende satser, samt eventuelle gebyrer for purring og inkasso.
6. Varighet og oppsigelse
Denne Kontrakten trer i kraft ved signering og løper inntil den sies opp av en av Partene med skriftlig varsel.
Oppsigelsestid er 1 måned ved prosjekter som ikke har en leveringsfrist, med mindre annet er skriftlig avtalt.
7. Konfidensialitet
Partene skal holde konfidensielt alt materiale og all informasjon mottatt fra den andre Parten i forbindelse med Oppdraget, og ikke videreformidle dette til tredjepart uten skriftlig samtykke.
8. Ansvar og ansvarsbegrensning
Oppdragstaker påtar seg å utføre Oppdraget i henhold til beste bransjestandard og i samsvar med avtalt omfang.
Oppdragsgiver forplikter seg til å gi Oppdragstaker tilgang til nødvendig informasjon og ressurser for å kunne gjennomføre Oppdraget.
Oppdragstaker er ikke ansvarlig for indirekte tap, følgeskader eller tap av fortjeneste.
9. Lovvalg og tvisteløsning
Denne Kontrakten reguleres av norsk rett. Tvister som måtte oppstå, og som ikke løses i minnelighet, skal avgjøres ved de ordinære domstoler på Oppdragstakers verneting.
10. Endringer og tillegg
Endringer eller tillegg til denne Kontrakten skal være skriftlige og signeres av begge Parter for å være gyldige.


Vi ser frem til et godt samarbeid!`;

    // Replace placeholders
    contractText = contractText.replace('{{companyname}}', company.name || '');
    contractText = contractText.replace('{{organizationnumber}}', company.organization_number || '');
    contractText = contractText.replace('{{address}}', company.street_address || company.address || '');
    contractText = contractText.replace('{{zipcode}}', company.postal_code || '');
    contractText = contractText.replace('{{city}}', company.city || '');
    contractText = contractText.replace('{{country}}', company.country || 'Norge');
    contractText = contractText.replace('{{projectdescription}}', project.description || project.name || '');
    
    // Handle deadline
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const formattedDeadline = format(deadlineDate, 'dd.MM.yyyy');
      contractText = contractText.replace('{{deadline}}', `Leveringsfrist: ${formattedDeadline}`);
    } else {
      contractText = contractText.replace('{{deadline}}', '');
    }
    
    // Handle price
    if (project.value) {
      contractText = contractText.replace('{{price}}', project.value.toString());
    } else {
      contractText = contractText.replace('{{price}}', '0');
    }

    // Create contract in the contracts table
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        company_id: project.company_id,
        contact_id: contact.id,
        project_id: project.id,
        template_type: 'project',
        content: contractText,
        title: `Project contract: ${project.name}`,
        status: 'unsigned',
        created_by: userId
      })
      .select()
      .single();

    if (contractError) throw contractError;
    
    return contract;
  } catch (error) {
    console.error('Error generating project contract:', error);
    throw error;
  }
}
