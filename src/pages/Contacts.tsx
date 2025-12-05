import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Mail, Phone, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useContacts, useCreateContact } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  lead: "bg-primary/20 text-primary",
};

const Contacts = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead" as const,
  });

  const { data: contacts, isLoading } = useContacts(search || undefined, statusFilter || undefined);
  const createContact = useCreateContact();

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.email || !newContact.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createContact.mutateAsync({
        ...newContact,
        totalCalls: 0,
        lastContact: "Just now",
      });
      toast.success("Contact created successfully");
      setIsDialogOpen(false);
      setNewContact({ name: "", email: "", phone: "", company: "", status: "lead" });
    } catch (error) {
      toast.error("Failed to create contact");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contacts</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your contact database</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newContact.company}
                      onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newContact.status}
                      onChange={(e) => setNewContact({ ...newContact, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white border border-border rounded-lg"
                    >
                      <option value="lead">Lead</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <Button onClick={handleCreateContact} className="w-full" disabled={createContact.isPending}>
                    {createContact.isPending ? "Creating..." : "Create Contact"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
            </select>
            <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 sm:h-10">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 sm:h-48 rounded-xl" />
              ))
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="glass-card rounded-xl p-4 sm:p-5 hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{contact.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{contact.company}</p>
                      </div>
                    </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Edit contact functionality coming soon")}>
                        Edit Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("View history functionality coming soon")}>
                        View Call History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Delete contact functionality coming soon")} className="text-destructive">
                        Delete Contact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>

                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-border">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${statusColors[contact.status]}`}>
                      {contact.status}
                    </span>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <span>{contact.totalCalls} calls</span>
                      <span className="mx-1 sm:mx-2">•</span>
                      <span>{contact.lastContact}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No contacts found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contacts;
