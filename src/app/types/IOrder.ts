export interface IOrder {
    items: [IOrderItems[]];
    client: IOrderClient[];
    payment_method: string;
}

export interface IOrderItems {
    cert_config: string;
    cert_view: string;
    count: number;
    price: number;
}

export interface IOrderClient {
    email: string;
    phone: string;
}