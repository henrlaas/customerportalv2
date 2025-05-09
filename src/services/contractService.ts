
import { supabase } from '@/integrations/supabase/client';

interface ContractTemplateData {
  companyname: string;
  organizationnumber: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
  projectdescription: string;
  deadline: string;
  price: string;
}

const contractService = {
  // Create a contract from a project
  createContractFromProject: async (projectId: string, userId: string) => {
    try {
      // Fetch the project with company details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        throw new Error(`Error fetching project: ${projectError.message}`);
      }

      // Find a primary contact for the company
      const { data: contacts, error: contactsError } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', project.company_id)
        .eq('is_primary', true)
        .limit(1);
      
      if (contactsError) {
        throw new Error(`Error fetching company contacts: ${contactsError.message}`);
      }

      // Use the first contact or throw an error
      const contactId = contacts && contacts.length > 0 
        ? contacts[0].id 
        : null;
      
      if (!contactId) {
        throw new Error('No primary contact found for this company');
      }

      // Create the contract template data
      const company = project.company;
      const templateData: ContractTemplateData = {
        companyname: company.name || 'Unknown',
        organizationnumber: company.organization_number || 'N/A',
        address: company.street_address || company.address || 'N/A',
        zipcode: company.postal_code || 'N/A',
        city: company.city || 'N/A',
        country: company.country || 'N/A',
        projectdescription: project.description || project.name || 'N/A',
        deadline: project.deadline 
          ? `Ferdigstillelse er avtalt til: ${new Date(project.deadline).toLocaleDateString('no-NO')}`
          : 'Ferdigstillelse er avtalt separat',
        price: project.value ? `${project.value.toLocaleString('no-NO')}` : 'Se tilbud'
      };

      // Create the contract content
      const contractContent = generateContractContent(templateData);

      // Insert the contract
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          company_id: project.company_id,
          contact_id: contactId,
          project_id: projectId,
          title: `Contract for ${project.name}`,
          content: contractContent,
          status: 'unsigned',
          template_type: 'project_contract',
          created_by: userId
        })
        .select()
        .single();

      if (contractError) {
        throw new Error(`Error creating contract: ${contractError.message}`);
      }

      return contract;
    } catch (error) {
      console.error('Error in createContractFromProject:', error);
      throw error;
    }
  }
};

// Generate contract content based on template
function generateContractContent(data: ContractTemplateData) {
  return `Oppdragskontrakt for Box Marketing
1. Partene
 Denne oppdragskontrakten ("Kontrakten") er inngått mellom:
Oppdragsgiver: ${data.companyname}, organisasjonsnummer ${data.organizationnumber}, adresse ${data.address}, ${data.zipcode} ${data.city}, ${data.country}
Oppdragstaker: Box Marketing AS, organisasjonsnummer 920441882, adresse Munkedamsveien 41, 0250 Oslo.
2. Formål
 Formålet med denne Kontrakten er å regulere samarbeidet mellom Partene, herunder de tjenester Oppdragstaker skal levere, samt priser, betalingsbetingelser og andre vilkår.
3. Tjenester
Oppdragstaker skal levere følgende tjenester til Oppdragsgiver (heretter «Oppdraget»):
${data.projectdescription}
${data.deadline}
4. Pris og prisestimat
Pris er basert på estimert antall timer og oppdragets omfang til: ${data.price},- eks. mva
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
}

export default contractService;
