import express from 'express';

export function indexWelcome(req, res) {
    return res.json('Welcome to the Auction API');
}