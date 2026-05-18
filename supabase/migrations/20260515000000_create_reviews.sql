-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date DATE NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (unauthenticated and authenticated can do anything)
CREATE POLICY "Allow all access for all users" ON public.reviews
    FOR ALL
    USING (true)
    WITH CHECK (true);
