
// Fix the Task type definition to match what's coming from the database
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  campaign_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  related_to?: { type: "none" | "deal" | "company" | "contact"; id: string } | null;
};

// Fix the contacts query
const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
  queryKey: ['profiles'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .order('first_name');
    
    if (error) {
      toast({
        title: 'Error fetching contacts',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
    
    return data as Contact[];
  },
});

// Fix the task form
const form = useForm({
  resolver: zodResolver(taskSchema),
  defaultValues: {
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'todo' as const,
    due_date: '',
    assigned_to: '',
    campaign_id: '',
    related_to: {
      type: 'none' as const,
      id: ''
    }
  },
});
