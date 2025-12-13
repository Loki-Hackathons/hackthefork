export interface User {
    id: string;
    username: string;
    avatar_url?: string;
    healthy_score: number; // 0-100
}

export interface Recipe {
    id: string;
    title: string;
    image_url: string;
    // ...
}

export interface Post {
    id: string;
    user_id: string;
    image_url: string;
    score: number;
    created_at: string;
}

