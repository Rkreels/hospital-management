"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  CreditCard,
  Banknote,
  Building2,
  FileText,
  CheckCircle,
  Printer,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    patientName: string;
    patientMRN: string;
    total: number;
    paidAmount: number;
    balance: number;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
  } | null;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: "Cash", label: "Cash", icon: Banknote },
  { value: "Credit Card", label: "Credit Card", icon: CreditCard },
  { value: "Debit Card", label: "Debit Card", icon: CreditCard },
  { value: "Check", label: "Check", icon: FileText },
  { value: "Bank Transfer", label: "Bank Transfer", icon: Building2 },
  { value: "Insurance", label: "Insurance", icon: FileText },
];

export default function PaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    id: string;
    invoiceNumber: string;
    patientName: string;
    patientMRN: string;
    method: string;
    amount: number;
    reference?: string;
    timestamp: string;
  } | null>(null);

  if (!invoice) return null;

  const handleAmountPreset = (preset: string) => {
    switch (preset) {
      case "full":
        setAmount(invoice.balance.toString());
        break;
      case "half":
        setAmount((invoice.balance / 2).toFixed(2));
        break;
      case "custom":
        setAmount("");
        break;
    }
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (paymentAmount > invoice.balance) {
      toast.error("Payment amount cannot exceed balance");
      return;
    }
    if (["Credit Card", "Debit Card", "Check", "Bank Transfer"].includes(paymentMethod) && !reference) {
      toast.error("Reference number is required for this payment method");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: paymentAmount,
          method: paymentMethod,
          reference: reference || undefined,
          notes: notes || undefined,
          paidAt: new Date().toISOString(),
          receivedBy: "System",
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setPaymentResult({
          ...result,
          invoiceNumber: invoice.invoiceNumber,
          patientName: invoice.patientName,
          patientMRN: invoice.patientMRN,
          method: paymentMethod,
          amount: paymentAmount,
          reference,
          timestamp: new Date().toISOString(),
        });
        setShowReceipt(true);
        toast.success("Payment processed successfully");
      } else {
        toast.error("Failed to process payment");
      }
    } catch {
      toast.error("Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Could not open print window");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .hospital-name { font-size: 24px; font-weight: bold; color: #1a56db; }
          .hospital-info { font-size: 12px; color: #666; margin-top: 5px; }
          .receipt-title { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }
          .label { color: #666; }
          .value { font-weight: 500; }
          .amount-section { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .amount-label { font-size: 14px; color: #666; }
          .amount-value { font-size: 28px; font-weight: bold; color: #1a56db; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th, .items-table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
          .items-table th { background: #f9fafb; font-size: 12px; color: #666; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .thank-you { font-size: 14px; font-weight: 500; margin-top: 10px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">HospitalHub Medical Center</div>
          <div class="hospital-info">123 Healthcare Avenue, Medical District</div>
          <div class="hospital-info">Phone: +1 (555) 123-4567 | Email: info@hospitalhub.com</div>
        </div>
        
        <div class="receipt-title">PAYMENT RECEIPT</div>
        
        <div class="info-row">
          <span class="label">Receipt No:</span>
          <span class="value">RCP-${Date.now().toString().slice(-8)}</span>
        </div>
        <div class="info-row">
          <span class="label">Invoice No:</span>
          <span class="value">${invoice.invoiceNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Patient:</span>
          <span class="value">${invoice.patientName}</span>
        </div>
        <div class="info-row">
          <span class="label">MRN:</span>
          <span class="value">${invoice.patientMRN}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Time:</span>
          <span class="value">${new Date().toLocaleTimeString()}</span>
        </div>
        
        <div class="amount-section">
          <div class="amount-label">Amount Paid</div>
          <div class="amount-value">$${paymentResult?.amount.toFixed(2) || "0.00"}</div>
        </div>
        
        <div class="info-row">
          <span class="label">Payment Method:</span>
          <span class="value">${paymentMethod}</span>
        </div>
        ${reference ? `<div class="info-row"><span class="label">Reference:</span><span class="value">${reference}</span></div>` : ""}
        <div class="info-row">
          <span class="label">Invoice Total:</span>
          <span class="value">$${invoice.total.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Previously Paid:</span>
          <span class="value">$${invoice.paidAmount.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Remaining Balance:</span>
          <span class="value">$${(invoice.balance - (paymentResult?.amount || 0)).toFixed(2)}</span>
        </div>
        
        <div class="footer">
          <div>Thank you for your payment</div>
          <div class="thank-you">Get well soon!</div>
          <div style="margin-top: 15px;">This is a computer-generated receipt</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleClose = () => {
    if (showReceipt) {
      onSuccess();
    }
    setShowReceipt(false);
    setPaymentResult(null);
    setAmount("");
    setReference("");
    setNotes("");
    setPaymentMethod("Cash");
    onOpenChange(false);
  };

  if (showReceipt) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Payment Successful
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-center">
                <p className="text-sm text-green-700">Amount Paid</p>
                <p className="text-3xl font-bold text-green-700">
                  ${paymentResult?.amount.toFixed(2)}
                </p>
              </div>
            </Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-medium">{invoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span className="font-medium text-amber-600">
                  ${(invoice.balance - (paymentResult?.amount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{invoice.patientName}</p>
                <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className="text-2xl font-bold text-primary">${invoice.balance.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <method.icon className="w-4 h-4" />
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Button
                variant={amount === invoice.balance.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => handleAmountPreset("full")}
              >
                Full
              </Button>
              <Button
                variant={amount === (invoice.balance / 2).toFixed(2) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAmountPreset("half")}
              >
                Half
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAmountPreset("custom")}
              >
                Custom
              </Button>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={invoice.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: $${invoice.balance.toFixed(2)}`}
            />
          </div>

          {/* Reference */}
          {["Credit Card", "Debit Card", "Check", "Bank Transfer"].includes(paymentMethod) && (
            <div className="space-y-2">
              <Label>Reference Number *</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={paymentMethod === "Check" ? "Check number" : "Transaction ID"}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={processing}>
            {processing ? "Processing..." : "Process Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
