import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { INITIAL_EVENTS } from "@/lib/eventhub-data";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return INITIAL_EVENTS.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = INITIAL_EVENTS.find((e) => e.id === id) || INITIAL_EVENTS[0];
  return {
    title: `Register: ${event.title} | EventHub`,
    description: `Register for ${event.title} at EventHub. Registration fee: ${event.feeLabel}. Instant QR Pass issued upon registration.`,
  };
}

export default async function RegisterEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = INITIAL_EVENTS.find((e) => e.id === id) || INITIAL_EVENTS[0];

  return (
    <div className="eh-reg-page">
      <div className="eh-reg-ambient" />
      <PublicHeader />
      <main>
        <EventRegistrationForm event={event} />
      </main>
      <PublicFooter />
    </div>
  );
}
