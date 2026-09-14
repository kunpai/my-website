import React from "react";
import CricketGame from "@/components/cricket";
import { featureGate } from '@/lib/content';

export const getStaticProps = featureGate('games');

export default function CricketPage() {
    return (
        <CricketGame />
    );
}
