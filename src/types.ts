export type OrderMode = 'livraison' | 'emporter';

export interface OrderItemOption {
  label: string;
  value: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  total: number;
  options: OrderItemOption[];
}

export interface OrderCustomer {
  name: string;
  phone: string;
}

export interface OrderAddress {
  line1: string;
  line2: string;
  postcode: string;
  city: string;
}

export interface Order {
  id: number;
  number: string;
  created_at: string | null;
  status: string;
  mode: OrderMode;
  customer: OrderCustomer;
  address: OrderAddress | null;
  shipping_method: string;
  items: OrderItem[];
  note: string;
  total: number;
  currency: string;
}

export interface PendingResponse {
  server_time: string;
  count: number;
  orders: Order[];
}

export interface PrintedResponse {
  id: number;
  already: boolean;
  printed_at: string;
}
