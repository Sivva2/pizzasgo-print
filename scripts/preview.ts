import { renderTicket } from '../src/ticket';
import type { Order } from '../src/types';

const delivery: Order = {
  id: 1241,
  number: '1241',
  created_at: '2026-10-26T20:15:00+01:00',
  status: 'processing',
  mode: 'livraison',
  customer: { name: 'Jean-Baptiste Delaunay', phone: '06 12 34 56 78' },
  address: {
    line1: '12 rue des Lilas, batiment C',
    line2: 'Appartement 24, 3e etage',
    postcode: '91610',
    city: 'Ballancourt-sur-Essonne',
  },
  shipping_method: 'Livraison',
  items: [
    {
      name: 'Margherita',
      quantity: 2,
      total: 18.0,
      options: [
        { label: 'Supplement', value: 'Chorizo' },
        { label: 'Sans', value: 'Olives' },
      ],
    },
    {
      name: 'Quatre Fromages Base Creme Fraiche',
      quantity: 1,
      total: 14.5,
      options: [{ label: 'Base', value: 'Creme fraiche' }],
    },
    { name: 'Tiramisu', quantity: 1, total: 4.5, options: [] },
  ],
  note: 'Sonner chez le voisin si pas de reponse, le digicode ne marche pas.',
  total: 37.0,
  currency: 'EUR',
};

const takeaway: Order = {
  id: 1242,
  number: '1242',
  created_at: '2026-10-26T20:22:00+01:00',
  status: 'processing',
  mode: 'emporter',
  customer: { name: 'Sofia M.', phone: '07 98 76 54 32' },
  address: null,
  shipping_method: 'A emporter',
  items: [{ name: 'Reine', quantity: 1, total: 11.0, options: [] }],
  note: '',
  total: 11.0,
  currency: 'EUR',
};

const ruler = '0123456789'.repeat(4).slice(0, 32);

for (const order of [delivery, takeaway]) {
  console.log(ruler);
  console.log(renderTicket(order));
  console.log('');
}
