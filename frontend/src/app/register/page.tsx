import React, { Suspense } from "react";
import { Metadata } from "next";
import { INITIAL_EVENTS } from "@/lib/eventhub-data";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";

export const metadata: Metadata = {
  title: "Event Registration | EventHub",
  description: "Register for events at EventHub. Solo & Team registration with instant QR Pass issuance.",
};

interface SearchProps {
  searchParams: Promise<{ event?: string }>;
}

async function RegisterFormContainer({ searchParams }: SearchProps) {
  const { event: eventId } = await searchParams;
  const event =
    INITIAL_EVENTS.find((e) => e.id === eventId) || INITIAL_EVENTS[0];

  return <EventRegistrationForm event={event} />;
}

export default function RegisterIndexPage(props: SearchProps) {
  return (
    <div className="eh-reg-page">
      <div className="eh-reg-ambient" />
      <PublicHeader />
      <main>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c084fc",
              }}
            >
              Loading registration form...
            </div>
          }
        >
          <RegisterFormContainer searchParams={props.searchParams} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
