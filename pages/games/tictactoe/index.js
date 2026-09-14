import React from "react";
import TicTacToe from "@/components/tictactoe";
import { featureGate } from '@/lib/content';

export const getStaticProps = featureGate('games');

export default function TicTacToePage() {
    return (
        <TicTacToe />
    );
}
