import {ICartItem, ICertificate, IPaymentMethod, IPriceValue, IProductTicket, IPromocode} from './Entities';

export interface ICartResponse {
  certificate: ICertificate;
  promocodes: IPromocode[];
  items: ICartItem[];
  total_cost: number;
  payment_method: IPaymentMethod;
}

export interface IAvailableTicketsResponse {
  tickets: IProductTicket[];
  prices: {[price_value_uuid: string]: IPriceValue};
}
