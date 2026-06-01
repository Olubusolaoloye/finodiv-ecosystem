
import React from 'react';
import { Course, Talent, Achievement, UserRole, CareerPath, AssessmentQuestion } from './types';

export const CAREER_PATHS: Record<string, CareerPath> = {
  SCD: {
    id: 'SCD',
    title: 'Smart Contract Developer',
    description: 'The backbone of Web3. You architect trustless logic in Solidity that powers DeFi, NFTs, and on-chain economies used by millions worldwide.',
    traits: ['Logical Thinker', 'Security Conscious', 'Problem Solver'],
    skills: ['Solidity', 'Foundry', 'OpenZeppelin', 'Hardhat', 'EVM Architecture'],
    duration: '6-12 Months',
    demand: 'Very High',
    overlap: 100,
    freelanceRate: '$100–$250/hr',
    platforms: ['Braintrust', 'Toptal', 'Crypto.jobs', 'Gitcoin'],
  },
  ZKD: {
    id: 'ZKD',
    title: 'ZK / L2 Developer',
    description: 'The frontier of cryptography. You build zero-knowledge circuits and Layer-2 systems — the most sought-after and highest-paid skill in the entire Web3 ecosystem.',
    traits: ['Mathematically Driven', 'Research-Oriented', 'Long-Term Thinker'],
    skills: ['Circom', 'Noir', 'Cairo', 'Halo2', 'zkSync Era', 'StarkNet'],
    duration: '12-18 Months',
    demand: 'Very High',
    overlap: 95,
    freelanceRate: '$150–$350/hr',
    platforms: ['Protocol Labs', 'EF Grants', 'Starkware', 'Polygon zkEVM'],
  },
  FWD: {
    id: 'FWD',
    title: 'Frontend Web3 Developer',
    description: 'The bridge between blockchain and users. You build the interfaces that make Web3 accessible — from wallet connections to real-time on-chain dashboards.',
    traits: ['Visual Thinker', 'UX Enthusiast', 'Creative Coder'],
    skills: ['React', 'Wagmi', 'Viem', 'RainbowKit', 'TypeScript', 'TailwindCSS'],
    duration: '4-8 Months',
    demand: 'High',
    overlap: 85,
    freelanceRate: '$80–$150/hr',
    platforms: ['Braintrust', 'Upwork', 'Contra', 'Crypto.jobs'],
  },
  SEC: {
    id: 'SEC',
    title: 'Smart Contract Security Auditor',
    description: 'The guardian of billions. You hunt for vulnerabilities before hackers do. Premium rates, global demand, and a career with real-world stakes — every audit matters.',
    traits: ['Adversarial Mindset', 'Hyper-Focused', 'Ethical Hacker'],
    skills: ['Foundry Fuzzing', 'Echidna', 'Slither', 'Invariant Testing', 'Reentrancy Patterns'],
    duration: '10-18 Months',
    demand: 'Very High',
    overlap: 90,
    freelanceRate: '$200–$500/hr',
    platforms: ['Code4rena', 'Sherlock', 'Immunefi', 'Cantina'],
  },
  AIW: {
    id: 'AIW',
    title: 'AI + Web3 Developer',
    description: 'The convergence frontier. You build on-chain AI agents, autonomous protocols, and LLM-powered dApps — combining the two most transformative technologies of our era.',
    traits: ['Experimental', 'Systems Thinker', 'Early Adopter'],
    skills: ['LangChain', 'Eliza Framework', 'Solidity', 'Python', 'Verifiable Compute'],
    duration: '6-10 Months',
    demand: 'Very High',
    overlap: 88,
    freelanceRate: '$100–$200/hr',
    platforms: ['Bittensor', 'Ritual.net', 'Giza Tech', 'Crypto.jobs'],
  },
  BDA: {
    id: 'BDA',
    title: 'Blockchain Data Analyst',
    description: 'The on-chain detective. You extract alpha from trillions of data points using SQL, Python, and analytics platforms to inform protocol decisions and investment theses.',
    traits: ['Analytical', 'Detail-Oriented', 'Inquisitive'],
    skills: ['Dune Analytics', 'Flipside', 'SQL', 'Python', 'The Graph', 'Pandas'],
    duration: '5-9 Months',
    demand: 'Growing',
    overlap: 70,
    freelanceRate: '$60–$120/hr',
    platforms: ['Dune', 'Nansen', 'Messari', 'Protocol Teams'],
  },
  DEF: {
    id: 'DEF',
    title: 'DeFi Researcher & Strategist',
    description: 'The economist of the future. You design yield strategies, model risk parameters, and author research reports that move millions of dollars in on-chain capital.',
    traits: ['Mathematical', 'Theoretical', 'Risk-Aware'],
    skills: ['Game Theory', 'Tokenomics', 'Yield Strategies', 'Risk Modeling', 'Python'],
    duration: '8-14 Months',
    demand: 'Growing',
    overlap: 75,
    freelanceRate: '$80–$160/hr',
    platforms: ['Gauntlet', 'Chaos Labs', 'Messari', 'Aave DAO', 'Sky (MakerDAO)'],
  },
  WPM: {
    id: 'WPM',
    title: 'Web3 Product Manager',
    description: 'The strategy master. You align engineers, designers, and community to ship products that actually get adopted — a rare and deeply valuable skill in a builder-heavy ecosystem.',
    traits: ['Strategic', 'Communicator', 'User Advocate'],
    skills: ['Tokenomics', 'Agile', 'User Research', 'Roadmapping', 'On-chain Analytics'],
    duration: '6-10 Months',
    demand: 'High',
    overlap: 72,
    freelanceRate: '$80–$150/hr',
    platforms: ['Web3.career', 'Crypto.jobs', 'LinkedIn', 'Deel'],
  },
  WGD: {
    id: 'WGD',
    title: 'Web3 Game Developer',
    description: 'The new entertainment architect. You build fully on-chain games and blockchain-integrated experiences that redefine ownership, play-to-earn, and digital economies.',
    traits: ['Creative', 'Technical', 'Player-Focused'],
    skills: ['Unity', 'Unreal Engine', 'MUD Framework', 'Solidity', 'Dark Forest Patterns'],
    duration: '8-14 Months',
    demand: 'Growing',
    overlap: 65,
    freelanceRate: '$80–$150/hr',
    platforms: ['Lattice', 'Treasure DAO', 'Immutable', 'Ronin Network'],
  },
  WCM: {
    id: 'WCM',
    title: 'Web3 Community Manager',
    description: 'The heartbeat of the protocol. You build and grow decentralized communities on Discord, X, and Telegram — turning anonymous addresses into loyal ecosystem participants.',
    traits: ['Extroverted', 'Empathetic', 'Culturally Aware'],
    skills: ['Discord Ops', 'X / Twitter', 'Governance Facilitation', 'Content Strategy', 'Event Management'],
    duration: '3-6 Months',
    demand: 'High',
    overlap: 55,
    freelanceRate: '$30–$70/hr',
    platforms: ['Upwork', 'Layer3', 'Crypto.jobs', 'Telegram Communities'],
  },
  TW: {
    id: 'TW',
    title: 'Web3 Technical Writer & Educator',
    description: 'The translator. You turn dense whitepapers and EIPs into clear documentation, tutorials, and educational content that onboards the next million builders.',
    traits: ['Clear Thinker', 'Patient', 'Precise'],
    skills: ['Technical Writing', 'Markdown', 'API Docs', 'Video Scripting', 'Docusaurus'],
    duration: '4-7 Months',
    demand: 'Growing',
    overlap: 60,
    freelanceRate: '$50–$100/hr',
    platforms: ['Gitcoin', 'Protocol Teams', 'Crypto.jobs', 'Upwork'],
  },
  DAO: {
    id: 'DAO',
    title: 'DAO Governance Specialist',
    description: 'The architect of decentralized democracy. You design governance frameworks, write proposals, facilitate votes, and help communities make collective decisions at scale.',
    traits: ['Diplomatic', 'Strategic', 'Community-First'],
    skills: ['Snapshot', 'Tally', 'Discourse', 'Token Engineering', 'Multisig Management'],
    duration: '4-8 Months',
    demand: 'Growing',
    overlap: 50,
    freelanceRate: '$50–$100/hr',
    platforms: ['Aragon', 'DAOhaus', 'MakerDAO', 'Gitcoin Governance'],
  },
};

export const CAREER_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: "What excites you most when working on a project?",
    options: [
      { label: "Building unbreakable cryptographic logic and smart contracts", impact: { SCD: 3, SEC: 2, ZKD: 1 } },
      { label: "Designing beautiful, interactive Web3 interfaces", impact: { FWD: 3, WPM: 1 } },
      { label: "Finding hidden patterns in on-chain data and market moves", impact: { BDA: 3, DEF: 2 } },
      { label: "Building AI agents that operate autonomously on-chain", impact: { AIW: 3, SCD: 1 } },
      { label: "Educating, leading communities, and onboarding newcomers", impact: { TW: 2, WCM: 2, DAO: 1 } },
    ]
  },
  {
    id: 2,
    question: "Which sector of Web3 energizes you the most?",
    options: [
      { label: "DeFi protocols, money markets, and yield infrastructure", impact: { SCD: 2, DEF: 3, SEC: 1 } },
      { label: "Layer 2s, zero-knowledge proofs, and blockchain scaling", impact: { ZKD: 3, SCD: 1 } },
      { label: "Gaming, metaverse, and digital ownership economies", impact: { WGD: 3, FWD: 1 } },
      { label: "AI agents, autonomous protocols, and on-chain intelligence", impact: { AIW: 3 } },
      { label: "DAOs, governance, and decentralized community coordination", impact: { DAO: 3, WCM: 2 } },
    ]
  },
  {
    id: 3,
    question: "What is your natural working style?",
    options: [
      { label: "Deep solo focus — hours in a terminal with no interruptions", impact: { SCD: 3, ZKD: 2, SEC: 2 } },
      { label: "Collaborative — brainstorming, whiteboarding, and sprints", impact: { WPM: 2, FWD: 2, WGD: 1 } },
      { label: "Research mode — reading papers, protocols, and audit reports", impact: { DEF: 3, ZKD: 1, SEC: 1 } },
      { label: "Social — engaging live with communities, calls, and events", impact: { WCM: 3, DAO: 2 } },
      { label: "Creative experiments — prototyping with new tools and frameworks", impact: { AIW: 2, WGD: 2, FWD: 1 } },
    ]
  },
  {
    id: 4,
    question: "How important is maximising your freelance income?",
    options: [
      { label: "Top priority — I want to be in the top 1% of earners", impact: { SEC: 3, ZKD: 3, SCD: 2 } },
      { label: "Very important — competitive rates with remote flexibility", impact: { FWD: 2, AIW: 2, BDA: 2 } },
      { label: "Balanced — good income but I also care about the mission", impact: { WPM: 2, DEF: 2, WGD: 1 } },
      { label: "Secondary — I’m driven by impact and ecosystem contribution", impact: { WCM: 2, DAO: 2, TW: 2 } },
    ]
  },
  {
    id: 5,
    question: "How do you feel about zero-knowledge cryptography?",
    options: [
      { label: "Fascinating — I want to specialise deeply in ZK circuits", impact: { ZKD: 3 } },
      { label: "Interesting — I’m open to learning the mathematics involved", impact: { SCD: 2, SEC: 1, ZKD: 1 } },
      { label: "I’ll use ZK technology but won’t build the primitives", impact: { FWD: 1, DEF: 1, BDA: 1 } },
      { label: "I want to combine ZK with AI and autonomous systems", impact: { AIW: 2, ZKD: 1 } },
      { label: "Not for me — I prefer people-focused or product work", impact: { WCM: 2, DAO: 2, WPM: 1 } },
    ]
  },
  {
    id: 6,
    question: "What is your primary career goal in the next 2 years?",
    options: [
      { label: "Become a top-rated independent security auditor", impact: { SEC: 3, SCD: 2 } },
      { label: "Ship my own dApp, protocol, or fully on-chain game", impact: { SCD: 2, FWD: 2, WGD: 2 } },
      { label: "Land a senior role at a tier-1 protocol or VC-backed team", impact: { WPM: 2, BDA: 2, FWD: 1 } },
      { label: "Build AI-powered Web3 tools used by thousands", impact: { AIW: 3 } },
      { label: "Lead a DAO or decentralised community at scale", impact: { DAO: 3, WCM: 2 } },
    ]
  },
  {
    id: 7,
    question: "Which tools or platforms are you most drawn to?",
    options: [
      { label: "Foundry, Hardhat, Remix, OpenZeppelin", impact: { SCD: 3, SEC: 2 } },
      { label: "Dune Analytics, Flipside, Subgraphs, Python notebooks", impact: { BDA: 3, DEF: 1 } },
      { label: "Wagmi, Viem, RainbowKit, Next.js, Tailwind", impact: { FWD: 3 } },
      { label: "Unity, Unreal Engine, MUD Framework, Godot", impact: { WGD: 3 } },
      { label: "LangChain, Eliza, CrewAI, on-chain agent frameworks", impact: { AIW: 3 } },
      { label: "Snapshot, Tally, Discourse, Safe Multisig", impact: { DAO: 3, WCM: 1 } },
    ]
  },
  {
    id: 8,
    question: "How technically deep do you want your career to be?",
    options: [
      { label: "Extremely deep — living in terminals, EIPs, and cryptographic proofs", impact: { SCD: 3, ZKD: 3, SEC: 3 } },
      { label: "Mostly technical with a strong design and UX layer", impact: { FWD: 2, WGD: 2 } },
      { label: "Technical analysis — data, modelling, and on-chain research", impact: { BDA: 3, DEF: 2 } },
      { label: "Strategic and product-focused with technical context", impact: { WPM: 3, DAO: 2 } },
      { label: "Moderate tech — heavy on communication and community", impact: { TW: 2, WCM: 2 } },
    ]
  },
  {
    id: 9,
    question: "Which freelance platform or hiring model appeals most?",
    options: [
      { label: "Competitive audit contests (Code4rena, Sherlock, Immunefi)", impact: { SEC: 3, SCD: 1 } },
      { label: "Premium async freelancing (Braintrust, Toptal, Contra)", impact: { FWD: 2, SCD: 2, AIW: 1 } },
      { label: "Protocol grants and ecosystem funding (Gitcoin, EF Grants)", impact: { ZKD: 2, TW: 2, DAO: 1 } },
      { label: "Full-time remote at a funded Web3 startup or DAO", impact: { WPM: 2, BDA: 2, WGD: 1 } },
      { label: "Running my own community or content business on-chain", impact: { WCM: 3, TW: 1 } },
    ]
  },
  {
    id: 10,
    question: "What motivates you most in the long run?",
    options: [
      { label: "Becoming a legendary researcher the ecosystem relies on", impact: { SEC: 3, ZKD: 2, SCD: 2 } },
      { label: "Building infrastructure that millions of people use daily", impact: { SCD: 2, ZKD: 2, FWD: 1 } },
      { label: "Turning on-chain data into insights that move markets", impact: { BDA: 3, DEF: 2 } },
      { label: "Creating games and experiences that redefine entertainment", impact: { WGD: 3 } },
      { label: "Shaping decentralised governance and culture at scale", impact: { DAO: 3, WCM: 2 } },
      { label: "Building autonomous AI systems that live and earn on-chain", impact: { AIW: 3, ZKD: 1 } },
    ]
  },
];

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced Solidity Development',
    description: 'Build, test, and deploy complex, secure smart contracts on the Ethereum blockchain.',
    instructor: 'Jane Doe',
    price: 999,
    category: 'Smart Contracts',
    level: 'Advanced',
    duration: '20h',
    image: 'https://picsum.photos/seed/solidity/800/450',
    niche: 'Blockchain Development'
  },
  {
    id: '2',
    title: 'Web3 Marketing & Growth',
    description: 'Learn strategies to market and grow decentralized applications and communities.',
    instructor: 'John Smith',
    price: 499,
    category: 'Marketing',
    level: 'Intermediate',
    duration: '12h',
    image: 'https://picsum.photos/seed/marketing/800/450',
    niche: 'Web3 Marketing'
  },
  {
    id: '3',
    title: 'DeFi Fundamentals',
    description: 'An introduction to the core concepts of decentralized finance, from lending to yield farming.',
    instructor: 'Alex Johnson',
    price: 399,
    category: 'DeFi',
    level: 'Beginner',
    duration: '8h',
    image: 'https://picsum.photos/seed/defi/800/450',
    niche: 'DeFi Fundamentals'
  },
  {
    id: '4',
    title: 'Smart Contract Auditing 101',
    description: 'Understand common vulnerabilities and best practices for securing smart contracts.',
    instructor: 'Chen Wei',
    price: 799,
    category: 'Security',
    level: 'Intermediate',
    duration: '15h',
    image: 'https://picsum.photos/seed/security/800/450',
    niche: 'Blockchain Development'
  }
];

export const TALENTS: Talent[] = [
  {
    id: 't1',
    name: 'Jordan Lee',
    title: 'Smart Contract Developer',
    bio: 'A passionate developer specializing in building secure and scalable decentralized applications on the Ethereum blockchain.',
    skills: ['Solidity', 'React', 'UI/UX', 'Web3.js', 'Hardhat', 'Ethers.js'],
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    verified: true,
    rating: 5.0,
    portfolio: [
      { id: 'p1', title: 'DeFi Dashboard', description: 'Comprehensive dashboard for tracking DeFi assets.', image: 'https://picsum.photos/seed/p1/400/300' },
      { id: 'p2', title: 'NFT Marketplace UI', description: 'Sleek and modern user interface for NFTs.', image: 'https://picsum.photos/seed/p2/400/300' }
    ],
    feedback: [
      { id: 'f1', author: 'Alex Johnson', role: 'CEO at ChainInnovate', avatar: 'https://i.pravatar.cc/150?u=alex', comment: 'Jordan is an exceptional developer. Highly recommended!', rating: 5.0 }
    ]
  },
  {
    id: 't2',
    name: 'Brenda Smith',
    title: 'UX Designer',
    bio: 'Specializing in Web3 product design and user research.',
    skills: ['Figma', 'Webflow', 'React'],
    avatar: 'https://i.pravatar.cc/150?u=brenda',
    verified: true,
    rating: 4.8,
    portfolio: [],
    feedback: []
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Web3 & Blockchain Fundamentals', issuedAt: 'Dec 2023', image: 'https://picsum.photos/seed/cert1/300/300', chain: 'BSC' },
  { id: 'a2', title: 'Advanced Smart Contract Development', issuedAt: 'Nov 2023', image: 'https://picsum.photos/seed/cert2/300/300', chain: 'BSC' }
];
