
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define a schema for the form
const formSchema = z.object({
  key: z.string().min(3, {
    message: "Setting key must be at least 3 characters.",
  }).refine(val => /^[a-z0-9_]+$/.test(val), {
    message: "Setting key can only contain lowercase letters, numbers, and underscores.",
  }),
  value: z.string().min(1, {
    message: "Setting value is required.",
  }),
  description: z.string().optional(),
});

interface AddSettingFormProps {
  onAdd: (key: string, value: string, description?: string) => Promise<void>;
}

export const AddSettingForm = ({ onAdd }: AddSettingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await onAdd(values.key, values.value, values.description || undefined);
      form.reset();
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to add setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        className="w-full"
        variant="outline"
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add New Setting
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Key</FormLabel>
                  <FormControl>
                    <Input placeholder="hourly_rate_manager" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use lowercase with underscores (e.g., hourly_rate_manager)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A description of what this setting is used for" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                Add Setting
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
