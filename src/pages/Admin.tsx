
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, User, Clock, DollarSign, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrders, updateOrderStatus } from "@/lib/supabase-utils";
import { Order } from "@/types/supabase";
import { CartItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les commandes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [toast]);

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order.id === id ? updatedOrder : order
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `Commande mise à jour avec le statut: ${getStatusLabel(status)}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">En attente</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">En traitement</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Terminée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Administration</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Gérez les commandes et les stocks
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex items-center animate-fade-up">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                <PackageOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Commandes</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex items-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Clients uniques</p>
                <p className="text-2xl font-bold">
                  {new Set(orders.map(order => order.username)).size}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex items-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-4">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total des ventes</p>
                <p className="text-2xl font-bold">
                  {formatPrice(orders.reduce((sum, order) => sum + Number(order.total_price), 0))}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-medium">Commandes récentes</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 mb-4 rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Aucune commande n'a encore été passée.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Accordion type="single" collapsible className="w-full">
                {orders.map((order) => (
                  <AccordionItem key={order.id} value={order.id}>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center text-left gap-y-2 w-full">
                        <div className="sm:w-1/5">
                          <Badge variant="outline" className="font-mono">
                            #{order.order_id}
                          </Badge>
                        </div>
                        <div className="sm:w-1/5 flex items-center">
                          <User className="h-4 w-4 mr-2 text-slate-400" />
                          {order.username}
                        </div>
                        <div className="sm:w-1/5 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          {formatDate(order.created_at)}
                        </div>
                        <div className="sm:w-1/5">
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="sm:w-1/5 font-medium text-right">
                          {formatPrice(Number(order.total_price))}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4">
                        <div className="flex justify-end mb-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                Modifier le statut <RefreshCw className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pending')}>
                                En attente
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>
                                En traitement
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                Terminée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                                Annulée
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Article</TableHead>
                              <TableHead>État</TableHead>
                              <TableHead>Qté</TableHead>
                              <TableHead className="text-right">Prix unitaire</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(order.items as CartItem[]).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {item.name_fr || item.name_en}
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.expansion}
                                  </div>
                                </TableCell>
                                <TableCell>{item.condition}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Card Planet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
