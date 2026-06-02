import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ReceiptText,
  Loader2,
  ShoppingBag,
  RefreshCcw,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { CommercialNavbar as Navbar } from "@/components/CommercialNavbar";
import { Footer } from "@/components/Footer";
import { CommercialAuthDialog as LoginDialog } from "@/components/CommercialAuthDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "@/context/LocationContext";
import {
  fetchCustomerOrders,
  getCustomerToken,
  returnSalesOrder,
  type SalesOrder,
  type SalesOrderItem,
} from "@/lib/api";
import { toast } from "sonner";

const Orders = () => {
  const navigate = useNavigate();
  const { selected } = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const loadOrders = async () => {
    try {
      const token = getCustomerToken();

      if (!token) {
        setLoginOpen(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchCustomerOrders();
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to load orders", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openReturnDialog = (order: SalesOrder) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  const closeReturnDialog = () => {
    setSelectedOrder(null);
    setReturnDialogOpen(false);
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const getStatusBadge = (status: string) => {
    if (["placed", "confirmed", "packed", "shipped"].includes(status)) {
      return "default";
    }

    if (["delivered"].includes(status)) {
      return "secondary";
    }

    if (["returned", "partially_returned"].includes(status)) {
      return "outline";
    }

    if (["cancelled"].includes(status)) {
      return "destructive";
    }

    return "secondary";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <main className="flex-1 container py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">
              Order history
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-primary">
              My Orders
            </h1>

            <p className="text-sm text-muted-foreground mt-2">
              Track your purchases, order status and returns.
            </p>
          </div>

          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-32 grid place-items-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-12 text-center">
            <ShoppingBag className="size-10 text-gold mx-auto mb-3" />

            <h3 className="font-display text-2xl text-primary mb-2">
              No orders yet
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              Once you place an order, it will appear here.
            </p>

            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                onReturn={() => openReturnDialog(order)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <ReturnOrderDialog
        open={returnDialogOpen}
        order={selectedOrder}
        onClose={closeReturnDialog}
        onReturned={async () => {
          closeReturnDialog();
          await loadOrders();
        }}
      />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoggedIn={() => {
          window.dispatchEvent(new Event("customer-auth-changed"));
          loadOrders();
        }}
      />

      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </div>
  );
};

function OrderCard({
  order,
  formatDate,
  getStatusBadge,
  onReturn,
}: {
  order: SalesOrder;
  formatDate: (value?: string) => string;
  getStatusBadge: (status: string) => any;
  onReturn: () => void;
}) {
  const items = order.items || [];

  const hasReturnableItems = items.some((item) => {
    const qty = Number(item.quantity || 0);
    const returned = Number(item.returned_quantity || 0);
    return qty - returned > 0;
  });

  const canReturn =
    hasReturnableItems &&
    !["returned", "cancelled"].includes(order.order_status);

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="p-5 md:p-6 border-b border-border bg-gradient-card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ReceiptText className="size-4 text-gold" />

              <span className="font-medium text-primary">
                {order.order_number}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              Placed on {formatDate(order.placed_at)}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Channel: {order.sub_channel || order.channel}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant={getStatusBadge(order.order_status)}>
              {order.order_status?.replaceAll("_", " ")}
            </Badge>

            <Badge variant="outline">
              Payment: {order.payment_status?.replaceAll("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="space-y-3">
          {items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-border grid gap-2 text-sm">
          <SummaryRow
            label="Subtotal"
            value={`₹${Number(order.subtotal || 0).toFixed(0)}`}
          />

          {Number(order.discount_amount || 0) > 0 && (
            <SummaryRow
              label="Discount"
              value={`− ₹${Number(order.discount_amount || 0).toFixed(0)}`}
              accent
            />
          )}

          <SummaryRow
            label="Delivery"
            value={
              Number(order.delivery_charge || 0) === 0
                ? "FREE"
                : `₹${Number(order.delivery_charge || 0).toFixed(0)}`
            }
            accent={Number(order.delivery_charge || 0) === 0}
          />

          <div className="flex items-center justify-between pt-2">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl text-primary">
              ₹{Number(order.total_amount || 0).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to={`/orders/${order.id}`}>View details</Link>
          </Button>

          {canReturn && (
            <Button variant="ghost" onClick={onReturn} className="gap-2">
              <RotateCcw className="size-4" />
              Return items
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReturnOrderDialog({
  open,
  order,
  onClose,
  onReturned,
}: {
  open: boolean;
  order: SalesOrder | null;
  onClose: () => void;
  onReturned: () => void;
}) {
  const [reason, setReason] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => order?.items || [], [order]);

  useEffect(() => {
    if (!order) {
      setReason("");
      setQtyMap({});
      return;
    }

    const initial: Record<string, number> = {};

    (order.items || []).forEach((item) => {
      initial[item.id] = 0;
    });

    setQtyMap(initial);
    setReason("");
  }, [order]);

  const selectedItems = useMemo(() => {
    return items
      .map((item) => ({
        item,
        quantity: Number(qtyMap[item.id] || 0),
      }))
      .filter((row) => row.quantity > 0);
  }, [items, qtyMap]);

  const estimatedRefund = selectedItems.reduce((sum, row) => {
    return sum + Number(row.item.unit_price || 0) * row.quantity;
  }, 0);

  const setReturnQty = (item: SalesOrderItem, nextQty: number) => {
    const purchasedQty = Number(item.quantity || 0);
    const returnedQty = Number(item.returned_quantity || 0);
    const maxQty = Math.max(purchasedQty - returnedQty, 0);

    const safeQty = Math.max(0, Math.min(nextQty, maxQty));

    setQtyMap((prev) => ({
      ...prev,
      [item.id]: safeQty,
    }));
  };

  const submitReturn = async () => {
    try {
      if (!order) return;

      if (selectedItems.length === 0) {
        toast.error("Select at least one item to return");
        return;
      }

      setSubmitting(true);

      const response = await returnSalesOrder(order.id, {
        reason: reason.trim() || "Customer requested return",
        items: selectedItems.map((row) => ({
          order_item_id: row.item.id,
          quantity: row.quantity,
        })),
      });

      toast.success("Return completed", {
        description: `Return ${response.return_order.return_number} created. Inventory has been restocked.`,
      });

      onReturned();
    } catch (error) {
      toast.error("Failed to return order", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Return order items</DialogTitle>
          <DialogDescription>
            Select items and quantity you want to return. Stock will be added
            back automatically after return is completed.
          </DialogDescription>
        </DialogHeader>

        {!order ? null : (
          <div className="space-y-5">
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs text-muted-foreground">Order number</div>
              <div className="font-medium text-primary">
                {order.order_number}
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const purchasedQty = Number(item.quantity || 0);
                const returnedQty = Number(item.returned_quantity || 0);
                const maxQty = Math.max(purchasedQty - returnedQty, 0);
                const selectedQty = Number(qtyMap[item.id] || 0);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border p-4 flex items-start gap-3"
                  >
                    <div className="size-12 rounded-xl bg-secondary grid place-items-center shrink-0">
                      <Package className="size-5 text-gold" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2">
                        {item.product_name}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        SKU: {item.sku}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        Purchased: {purchasedQty} · Already returned:{" "}
                        {returnedQty} · Returnable: {maxQty}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        Refund/unit: ₹{Number(item.unit_price || 0).toFixed(0)}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {maxQty <= 0 ? (
                        <Badge variant="outline">Returned</Badge>
                      ) : (
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            type="button"
                            onClick={() => setReturnQty(item, selectedQty - 1)}
                            className="size-9 grid place-items-center hover:bg-secondary rounded-l-full"
                          >
                            <Minus className="size-3.5" />
                          </button>

                          <span className="w-9 text-center text-sm font-medium">
                            {selectedQty}
                          </span>

                          <button
                            type="button"
                            onClick={() => setReturnQty(item, selectedQty + 1)}
                            className="size-9 grid place-items-center hover:bg-secondary rounded-r-full"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Return reason
              </label>

              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Example: Product damaged, wrong item, no longer needed..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="rounded-xl bg-gold/10 p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Estimated refund
              </span>

              <span className="font-display text-2xl text-primary">
                ₹{estimatedRefund.toFixed(0)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            onClick={submitReturn}
            disabled={submitting || selectedItems.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemRow({ item }: { item: SalesOrderItem }) {
  const returnedQty = Number(item.returned_quantity || 0);
  const quantity = Number(item.quantity || 0);

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3">
      <div className="size-12 rounded-xl bg-background grid place-items-center shrink-0">
        <Package className="size-5 text-gold" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground line-clamp-2">
          {item.product_name}
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          SKU: {item.sku}
        </div>

        {returnedQty > 0 && (
          <div className="text-xs text-gold-deep mt-1">
            Returned: {returnedQty} of {quantity}
          </div>
        )}
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-medium">
          ₹{Number(item.total_price || 0).toFixed(0)}
        </div>

        <div className="text-xs text-muted-foreground">Qty: {quantity}</div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-gold-deep font-medium" : ""}>
        {value}
      </span>
    </div>
  );
}

export default Orders;