import {IDuration} from './IDuration';
import {IListLang} from './IListLang';

export interface IEvent {
    product_type: string;
    uuid: string;
    created_at: string;
    is_active: boolean;
    is_deleted: boolean;
    product_category_uuid: any;
    tags: any;
    name: any;
    short_name: any;
    description: any;
    short_description: any;
    extended_props: any;
    poster: any;
    media: any;
    begin_time: string; // удалить
    rating: any;
    pg_rating: string;
    duration: IDuration;
    NearestSchedule: {
        uuid: string;
        created_at: string;
        updated_at: string;
        deleted_at: any;
        is_active: boolean;
        is_deleted: false;
        hall_uuid: string;
        spot_uuid: string;
        event_uuid: string;
        has_geometry: boolean;
        is_for_sale: false;
        season_event_uuid: any;
        is_season_head: false;
        is_season_part: false;
        season_schedules: any;
        begin_time: string;
        end_time: string;
        duration: IDuration;
        hall_geometry_uuid: string;
        Spot: {
            uuid: string;
            created_at: string;
            updated_at: string;
            deleted_at: any;
            is_active: boolean;
            is_deleted: boolean;
            name: IListLang;
            short_name: IListLang;
            description: any;
            address: IListLang;
            location: any;
            media_info: any;
            contacts: any;
            work_hours: any;
            website: any;
            meta_tags_uuid: any;
            tags: any;
        };
        Hall: {
            uuid: string;
            created_at: string;
            updated_at: string;
            deleted_at: any;
            is_active: boolean;
            is_deleted: boolean;
            name: IListLang;
            short_name: IListLang;
            description: any;
            address: IListLang;
            location: any;
            media_info: any;
            contacts: any;
            work_hours: any;
            website: any;
            spot_uuid: string;
        }
    }
}