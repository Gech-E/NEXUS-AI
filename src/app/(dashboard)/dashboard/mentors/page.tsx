"use client";

import { useEffect, useState } from "react";
import { Users, Star, Briefcase, MapPin, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { BookingModal } from "@/components/BookingModal";

interface Mentor {
  id: string;
  userId: string;
  name: string;
  headline: string;
  expertise: string[];
  industries: string[];
  company: string;
  rating: number;
  totalSessions: number;
  yearsExperience: number;
  isVerified: boolean;
  location: string;
  image: string | null;
  hourlyRate: number | null;
  currency: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = (query?: string) => {
    setLoading(true);
    const url = query ? `/api/mentors?search=${encodeURIComponent(query)}` : "/api/mentors";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMentors(data);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    fetchMentors(search);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mentor Marketplace</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Find the perfect mentor for your journey</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "var(--text-muted)" }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 relative"
            placeholder="Search by name or expertise..."
          />
        </div>
        <Button variant="secondary" onClick={handleSearch} className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
        </div>
      ) : mentors.length === 0 ? (
        <Card className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No mentors found</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {search ? "Try a different search term." : "No mentors are available at the moment. Check back soon!"}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mentors.map((mentor) => (
            <Card key={mentor.id} hoverable className="group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-600))" }}>
                  {mentor.image ? (
                    <img src={mentor.image} alt={mentor.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    mentor.name.split(" ").map((n) => n[0]).join("")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-[var(--color-brand-500)] transition-colors">{mentor.name}</h3>
                    {mentor.isVerified && <CheckBadge />}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{mentor.headline}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    {mentor.company && <><Briefcase className="w-3 h-3" /> {mentor.company} · </>}
                    {mentor.location && <><MapPin className="w-3 h-3" /> {mentor.location}</>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{mentor.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{mentor.totalSessions} sessions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {mentor.expertise.map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{e}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  className="flex-1 text-sm py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookingMentor({ id: mentor.id, name: mentor.name });
                  }}
                >
                  Request Session
                </Button>
                <Link href={`/dashboard/mentors/${mentor.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" className="text-sm py-2 px-4">View Profile</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {bookingMentor && (
        <BookingModal
          mentorId={bookingMentor.id}
          mentorName={bookingMentor.name}
          onClose={() => setBookingMentor(null)}
          onSuccess={() => {
            setBookingMentor(null);
            // Optionally, you can show a success toast or redirect to sessions page here.
            window.location.href = "/dashboard/sessions";
          }}
        />
      )}
    </div>
  );
}

function CheckBadge() {
  return <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-600))" }}><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>;
}
