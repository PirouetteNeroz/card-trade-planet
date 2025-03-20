
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getOrders, Order, CartItem } from "@/lib/api";
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
import { PackageOpen, User, Clock, DollarSign } from "lucide-react";

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = () => {
      const ordersData = getOrders();
      // Sort orders by date descending
      const sortedOrders = [...ordersData].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedOrders);
    };
    
    loadOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Administration</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Gérez les commandes et les stocks
        </p>
        
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
                {formatPrice(orders.reduce((sum, order) => sum + order.totalPrice, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-medium">Commandes récentes</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Aucune commande n'a encore été passée.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Accordion type="single" collapsible className="w-full">
                {orders.map((order, index) => (
                  <AccordionItem key={order.orderId} value={order.orderId}>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center text-left gap-y-2 w-full">
                        <div className="sm:w-1/4">
                          <Badge variant="outline" className="font-mono">
                            #{order.orderId.slice(-8)}
                          </Badge>
                        </div>
                        <div className="sm:w-1/4 flex items-center">
                          <User className="h-4 w-4 mr-2 text-slate-400" />
                          {order.username}
                        </div>
                        <div className="sm:w-1/4 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="sm:w-1/4 font-medium text-right">
                          {formatPrice(order.totalPrice)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4">
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
                            {order.items.map((item) => (
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
