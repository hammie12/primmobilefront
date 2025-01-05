export interface Professional {
  id: string;
  business_name: string;
  category?: string;
  rating?: number;
  about?: string;
  profile_image?: string;
  address?: string;
  services?: Array<{
    name: string;
    duration?: number;
    price?: number;
  }>;
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    appointments?: Array<{
      id: string;
      date: string;
      time: string;
      service: string;
      status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
      customer?: {
        name: string;
        image?: string;
      };
    }>;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    customer: {
      first_name: string;
      last_name: string;
    };
  }>;
  average_rating?: number;
  number_of_reviews?: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
} 