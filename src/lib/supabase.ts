import { createClient } from '@supabase/supabase-js';

// حَطِّيتْ لِيكْ الـ Key اللِّي بَانْ فْالصُّورَة، غِيرْ نْقَلْ الـ URL وْحَطُّو لْفُوقْ
const supabaseUrl = 'https://qynkushbkxylkmfoqvkg.supabase.co'; // غِيرْ تَأَكَّدْ مِinternal id هَادَا هُوَ اللِّي فْالرَّابِطْ دْالصُّورَة
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bmt1c2hia3h5bGttZm9xdmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTEzNjQsImV4cCI6MjA5NDU4NzM2NH0.MXq_1uLrZQNY8mHeSkw0GYHoNHopSIoPgwIeWFxLcWc'; // كَمِّلْ النَّسْخْ دْيَالُو كَامِلْ مْنْ الزِّرْ الرَّمَادِي

export const supabase = createClient(supabaseUrl, supabaseKey);