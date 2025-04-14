import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/sidebar';
import DataTable from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Contact } from '@shared/schema';
import { Mail, Trash2, Eye } from 'lucide-react';

export default function AdminContacts() {
  const { toast } = useToast();
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/admin/contacts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/contacts');
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json();
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/admin/contacts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Contact deleted',
        description: 'The contact message has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      setContactToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete contact',
        variant: 'destructive',
      });
    },
  });

  // View contact details and mark as read if unread
  const viewContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.read) {
      markAsReadMutation.mutate(contact.id);
    }
  };

  // Columns for the data table
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof Contact,
      cell: (contact: Contact) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{contact.name}</span>
          {!contact.read && (
            <Badge className="bg-blue-500">New</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email' as keyof Contact,
      cell: (contact: Contact) => (
        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
          {contact.email}
        </a>
      ),
    },
    {
      header: 'Subject',
      accessorKey: 'subject' as keyof Contact,
    },
    {
      header: 'Received',
      accessorKey: 'createdAt' as keyof Contact,
      cell: (contact: Contact) => formatDate(contact.createdAt),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as keyof Contact,
      cell: (contact: Contact) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => viewContact(contact)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => setContactToDelete(contact.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Handle delete confirmation
  const confirmDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
          
          {contacts && contacts.length > 0 ? (
            <DataTable
              data={contacts}
              columns={columns}
              primaryKey="id"
              isLoading={isLoading}
            />
          ) : !isLoading ? (
            <div className="text-center py-16 bg-white rounded-lg border">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                When visitors send you messages through the contact form, they will appear here.
              </p>
            </div>
          ) : null}
          
          {/* Contact View Dialog */}
          <Dialog open={selectedContact !== null} onOpenChange={(open) => !open && setSelectedContact(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Message</DialogTitle>
              </DialogHeader>
              
              {selectedContact && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">From:</div>
                    <div>{selectedContact.name}</div>
                  </div>
                  
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Email:</div>
                    <div>
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Subject:</div>
                    <div>{selectedContact.subject}</div>
                  </div>
                  
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Date:</div>
                    <div>{formatDate(selectedContact.createdAt, true)}</div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="font-medium text-muted-foreground mb-2">Message:</div>
                    <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{selectedContact.message}</div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`;
                      }}
                    >
                      Reply via Email
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedContact(null);
                        setContactToDelete(selectedContact.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={contactToDelete !== null} onOpenChange={(open) => !open && setContactToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this contact message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined | null, withTime = false) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (withTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
