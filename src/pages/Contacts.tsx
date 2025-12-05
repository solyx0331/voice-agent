import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Mail, Phone, MoreVertical } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalCalls: number;
  lastContact: string;
  status: "active" | "inactive" | "lead";
}

const contacts: Contact[] = [
  { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "+1 (555) 123-4567", company: "Tech Corp", totalCalls: 12, lastContact: "2 hours ago", status: "active" },
  { id: "2", name: "Emma Wilson", email: "emma.w@company.com", phone: "+1 (555) 234-5678", company: "Design Studio", totalCalls: 8, lastContact: "1 day ago", status: "active" },
  { id: "3", name: "Michael Brown", email: "m.brown@startup.io", phone: "+1 (555) 345-6789", company: "StartUp Inc", totalCalls: 3, lastContact: "3 days ago", status: "lead" },
  { id: "4", name: "Sarah Davis", email: "sarah.d@enterprise.com", phone: "+1 (555) 456-7890", company: "Enterprise Co", totalCalls: 24, lastContact: "5 hours ago", status: "active" },
  { id: "5", name: "James Miller", email: "james@consulting.net", phone: "+1 (555) 567-8901", company: "Consulting Group", totalCalls: 6, lastContact: "1 week ago", status: "inactive" },
  { id: "6", name: "Lisa Anderson", email: "l.anderson@media.co", phone: "+1 (555) 678-9012", company: "Media House", totalCalls: 15, lastContact: "4 hours ago", status: "active" },
];

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  lead: "bg-primary/20 text-primary",
};

const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
              <p className="text-muted-foreground">Manage your contact database</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                    {contact.status}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    <span>{contact.totalCalls} calls</span>
                    <span className="mx-2">•</span>
                    <span>{contact.lastContact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contacts;
