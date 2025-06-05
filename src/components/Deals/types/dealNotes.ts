
export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DealNoteFormData {
  content: string;
}
