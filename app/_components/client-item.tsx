"use client"

import React, { useState } from "react";
import { Prisma } from "@prisma/client";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog } from "./ui/dialog";
import NewOrderDialog from "./new-order-dialog";
import EditClientDialog from "./edit-client-dialog";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteClient } from "../_actions/delete-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog"

export type ClientWithOrders = Prisma.ClientGetPayload<{
    select: {
        id: true;
        name: true;
        fantasyName: true;
        address: true;
        city: true;
        email: true;
        phone: true;
        district: true;
        zipCode: true;
        corporateName: true;
        cnpjOrCpf: true;
        referencePoint: true;
        registerNumber: true;
        createdAt: true;
        updatedAt: true;
        orders?: {
            select: {
                id: true;
                totalValue: true;
                discount: true;
                createdAt: true;
                registerNumber: true;
                client: {
                    select: {
                        fantasyName: true;
                    };
                };
            };
        };
    };
    include: { orders: true };
}>;

type Products = Prisma.ProductGetPayload<{
    select: {
        id: true;
        name: true;
        price: true;
    };
}>;

export interface ClientItemProps {
    client: ClientWithOrders;
    products: Products[];
    onDelete: (clientId: string) => void;
}

const ClientItem: React.FC<ClientItemProps> = ({ client, products, onDelete }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const openDialog = () => setIsDialogOpen(true);
    const openEditDialog = () => setIsEditDialogOpen(true);
    const closeEditDialog = () => setIsEditDialogOpen(false);

    const formatCurrency = (value: Prisma.Decimal | null) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value ? Number(value) : 0);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const handleDeleteClientClick = async () => {
        try {
            await deleteClient(client.id);
            toast.success("Cliente removido com sucesso!");
            onDelete(client.id);
        } catch (error) {
            console.error("Erro ao remover cliente:", error);
        }
    };

    return (
        <tr className="text-sm text-zinc-800">
            <Sheet>
                <SheetTrigger asChild>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap cursor-pointer uppercase hover:bg-zinc-200">
                        {client.name}
                    </td>
                </SheetTrigger>
                <td className="px-4 py-4 sm:px-6 whitespace-nowrap uppercase">{client.fantasyName ?? 'N/A'}</td>
                <td className="px-4 py-4 sm:px-6 whitespace-nowrap">{client.orders.length}</td>
                <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="default">
                                <Trash size={16} />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-4 rounded-sm font-[family-name:var(--font-geist-sans)] max-h-[90%] w-11/12 overflow-x-auto">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você realmente deseja excluir esse cliente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não poderá ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteClientClick}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </td>
                <SheetContent className="overflow-auto w-11/12 bg-card text-gray-200 font-[family-name:var(--font-geist-sans)]">
                    <Button variant="default" className="p-3" onClick={openEditDialog}>
                        <Pencil size={16} />
                    </Button>
                    <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
                        <EditClientDialog client={client} />
                    </Dialog>

                    <div className="mt-6">
                        <div className="mb-4 flex items-center gap-4 border-b pb-4">
                            <h2 className="text-xl font-bold uppercase">{client.name}</h2>
                            <Badge className="bg-gray-800 border">
                                00{client.registerNumber}
                            </Badge>
                        </div>
                        <p className="mb-2 uppercase"><strong className="normal-case">Nome Fantasia:</strong> {client.fantasyName}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Razão Social:</strong> {client.corporateName}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">CNPJ/CPF:</strong> {client.cnpjOrCpf}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Endereço:</strong> {client.address}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Bairro:</strong> {client.district}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Cidade:</strong> {client.city}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">CEP:</strong> {client.zipCode}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Ponto de referência:</strong> {client.referencePoint}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">E-mail:</strong> {client.email}</p>
                        <p className="mb-2 uppercase"><strong className="normal-case">Telefone:</strong> {client.phone}</p>

                        <p className="mb-4"><strong>Número de pedidos:</strong> {client.orders.length}</p>

                        <div className="border-t pt-3 mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Pedidos recentes</h3>
                            <Button variant="default" className="font-bold p-2" onClick={openDialog}>
                                Novo pedido
                            </Button>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <NewOrderDialog products={products} clientId={client.id} />
                            </Dialog>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-400">
                                <thead className="bg-gray-200 text-xs">
                                    <tr>
                                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Numero</th>
                                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-100 divide-y text-gray-500 divide-gray-300 text-xs">
                                    {client.orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-2 py-4 whitespace-nowrap">00{order.registerNumber}</td>
                                            <td className="px-2 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                            <td className="px-2 py-4 whitespace-nowrap">{formatCurrency(order.totalValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </tr>
    );
};

export default ClientItem;
