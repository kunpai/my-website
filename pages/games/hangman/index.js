import React from "react";
import Hangman from "@/components/hangman";
import { featureGate } from '@/lib/content';

export const getStaticProps = featureGate('games');

export default function HangmanPage() {
    return (
        <Hangman />
    );
}
