
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { Company } from '@/types/company';
import { format } from 'date-fns';

interface ContractData {
  title: string;
  content: string;
  company_id: string;
  contact_id?: string;
  project_id: string;
  template_type: string;
  created_by: string;
  status: 'unsigned';
}

export const contractService = {
  /**
   * Generate contract content from template using project and company data
   */
  generateContractContent: async (
    project: Project,
    company: Company,
    userId: string
  ): Promise<string> {
    // Norwegian contract template
    const contractTemplate = `Oppdragskontrakt for Box Marketing
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

    // Replace placeholders with actual values
    let content = contractTemplate;
    content = content.replace('{{companyname}}', company.name);
    content = content.replace('{{organizationnumber}}', company.organization_number || '-');
    content = content.replace('{{address}}', company.street_address || company.address || '-');
    content = content.replace('{{zipcode}}', company.postal_code || '-');
    content = content.replace('{{city}}', company.city || '-');
    content = content.replace('{{country}}', company.country || 'Norge');
    content = content.replace('{{projectdescription}}', project.description || project.name);
    content = content.replace('{{price}}', project.value ? project.value.toString() : '-');
    
    // Add deadline if available
    let deadlineText = '';
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const formattedDate = format(deadlineDate, 'dd.MM.yyyy');
      deadlineText = `Leveringsfrist: ${formattedDate}`;
    }
    content = content.replace('{{deadline}}', deadlineText);
    
    return content;
  },

  /**
   * Create a contract for a project
   */
  createContractFromProject: async (
    projectId: string,
    userId: string
  ): Promise<string> {
    // Fetch project with company
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, company:companies(*)')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      throw projectError;
    }

    // Get primary contact for company
    const { data: contacts, error: contactsError } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', project.company_id)
      .eq('is_primary', true)
      .limit(1);

    if (contactsError) {
      console.error('Error fetching company contacts:', contactsError);
      throw contactsError;
    }

    const contactId = contacts?.length > 0 ? contacts[0].user_id : undefined;

    // Generate contract content
    const content = await this.generateContractContent(project, project.company, userId);

    // Create contract in database
    const contractData: ContractData = {
      title: `Project contract: ${project.name}`,
      content,
      company_id: project.company_id,
      contact_id: contactId,
      project_id: projectId,
      template_type: 'project_contract',
      created_by: userId,
      status: 'unsigned',
    };

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (contractError) {
      console.error('Error creating contract:', contractError);
      throw contractError;
    }

    return contract.id;
  },
};

export default contractService;
