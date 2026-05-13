"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Briefcase, MapPin, Loader2, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { BookingModal } from "@/components/BookingModal";
import Link from "next/link";

interface MentorDetails {
  id: string;
  name: string;
  headline: string;
  bio: string;
  expertise: string[];
  industries: string[];
  company: string;
  title: string;
  rating: number;
  totalSessions: number;
  totalReviews: number;
  yearsExperience: number;
  isVerified: boolean;
  location: string;
  image: string | null;
  hourlyRate: number | null;
  currency: string;
}

export default function MentorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [mentor, setMentor] = useState<MentorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/mentors/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setMentor(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-4">Mentor not found</h2>
        <Button onClick={() => router.push("/dashboard/mentors")}>Back to Mentors</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/mentors" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Mentors
        </Link>
      </div>

      <Card className="p-6 md:p-8 relative overflow-hidden">
        {/* Background Accent */}
        <div 
          className="absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, var(--color-brand-500), transparent)" }}
        />

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-xl" 
               style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-600))" }}>
            {mentor.image ? (
              <img src={mentor.image} alt={mentor.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              mentor.name.split(" ").map((n) => n[0]).join("")
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{mentor.name}</h1>
                  {mentor.isVerified && <CheckCircle className="w-5 h-5 text-blue-400" />}
                </div>
                <p className="text-lg text-gray-300 mb-2">{mentor.headline}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {mentor.company && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> {mentor.title ? `${mentor.title} at ` : ""}{mentor.company}
                    </span>
                  )}
                  {mentor.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {mentor.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {mentor.yearsExperience}+ years exp.
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg font-medium">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {mentor.rating.toFixed(1)} ({mentor.totalReviews} reviews)
                </div>
                <Button size="lg" className="w-full md:w-auto" onClick={() => setBookingOpen(true)}>
                  Request Session
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {mentor.bio || "No biography provided yet."}
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill) => (
                  <span key={skill} className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold mb-3">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.industries.map((ind) => (
                  <span key={ind} className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {ind}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Card>

      {bookingOpen && (
        <BookingModal
          mentorId={mentor.id}
          mentorName={mentor.name}
          onClose={() => setBookingOpen(false)}
          onSuccess={() => {
            setBookingOpen(false);
            router.push("/dashboard/sessions");
          }}
        />
      )}
    </div>
  );
}
