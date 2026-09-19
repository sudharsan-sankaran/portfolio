import type { Metadata } from "next";
import { Instrument_Sans, Bricolage_Grotesque, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
const display=Bricolage_Grotesque({subsets:["latin"],weight:["400","600","800"],variable:"--font-display",display:"swap"});
const body=Instrument_Sans({subsets:["latin"],weight:["400","500","600"],variable:"--font-body",display:"swap"});
const mono=Spline_Sans_Mono({subsets:["latin"],weight:["400"],variable:"--font-mono",display:"swap"});
export const metadata:Metadata={title:"Sudharsan Sankaran — Data & technology",description:"Computer science student, operations background and a practical interest in data. Explore Sudharsan Sankaran’s profile, experience and project library.",metadataBase:new URL("https://sudharsan-portfolio-rust.vercel.app/"),openGraph:{title:"Sudharsan Sankaran — Portfolio",description:"Computer science student, operations background and a practical interest in data. Explore Sudharsan Sankaran’s profile, experience and project library.",url:"https://sudharsan-portfolio-rust.vercel.app/",type:"website",images:[{url:"/images/sudharsan-polished.png",alt:"Polished portrait of Sudharsan Sankaran wearing sunglasses."}]},robots:{index:true,follow:true}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body></html>;}
