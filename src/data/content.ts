// All section content lives here. Order in each array is display order.

export interface Project {
  key: string;
  name: string;
  domain: string;
  desc: string;
  problemShort: string;
  solutionShort: string;
  outcome: string;
  stack: string[];
  flow: string[];
  overview: string;
  problem: string;
  approach: string;
  architecture: string;
  challenges: string[];
  results: string;
  /** Repo and demo URLs. GitHub falls back to the profile link; Demo buttons only show when set. */
  links?: { github?: string; demo?: string };
  /** Shown in the case study. Put images in /public and reference them like `${import.meta.env.BASE_URL}carefirst-1.png`. */
  screenshots?: { src: string; alt: string }[];
}

export const projects: Project[] = [
  {
    key: 'carefirst',
    name: 'CareFirst AI',
    domain: 'Emergency AI · Voice AI',
    desc: 'An AI-powered emergency response and command-centre platform designed to handle SOS requests, voice interaction, location sharing, emergency classification, and coordination.',
    problemShort: 'Callers lose critical minutes to manual triage, unclear locations and fragmented coordination.',
    solutionShort: 'A voice-first SOS flow that transcribes, classifies with an LLM and routes cases to a command centre.',
    outcome: 'An end-to-end path from SOS request to coordinated response, built around speech-to-speech interaction.',
    stack: ['Voice AI', 'LLMs', 'Speech-to-Text', 'Text-to-Speech', 'Location APIs', 'Emergency workflows'],
    flow: ['SOS / Voice', 'Speech-to-Text', 'LLM classification', 'Location', 'Command centre'],
    overview: 'CareFirst AI treats an emergency call as a pipeline. A person raises an SOS by voice, the system understands what is happening, captures where it is happening, and puts a structured case in front of the people who can respond, while continuing to talk back to the caller.',
    problem: 'In an emergency, every step that depends on a human operator to listen, interpret and type adds delay. Location details are often vague, and information gets scattered across calls, messages and dispatch tools.',
    approach: 'Speech-to-text turns the caller’s voice into text, an LLM classifies the emergency type and extracts key details, location is captured through location APIs, and text-to-speech keeps the caller informed. Cases flow into a command-centre view built around emergency workflows.',
    architecture: 'Voice input is streamed to a speech-to-text service. The transcript is passed to an LLM for classification and structured extraction. Location data is attached from the client, and the resulting case is published to the command-centre interface, where coordination happens. Responses are synthesised back to the caller with text-to-speech.',
    challenges: [
      'Keeping the speech-to-speech loop fast enough to feel like a conversation.',
      'Classifying reliably from short, noisy and stressed utterances.',
      'Designing workflows that keep a human coordinator in control of every decision.',
    ],
    results: 'A working emergency platform covering SOS intake, voice interaction, location sharing, classification and coordination in a single system.',
  },
  {
    key: 'vital',
    name: 'Vital Monitor Mirroring',
    domain: 'Healthcare · Real-time',
    desc: 'Software designed to mirror / stream vital-monitor information into a centralized software interface.',
    problemShort: 'Vital signs stay locked on individual bedside monitors, hard to watch across patients.',
    solutionShort: 'Capture monitor output and stream it over the network into one central interface.',
    outcome: 'Vital-monitor information mirrored in real time into a centralized view.',
    stack: ['Healthcare data', 'Networking', 'Real-time streaming', 'Medical device integration'],
    flow: ['Bedside monitor', 'Capture', 'Network stream', 'Central interface'],
    overview: 'Vital Monitor Mirroring brings the information shown on bedside vital monitors into a single software interface, so it can be seen away from the bedside and across several devices at once.',
    problem: 'Monitors are designed to be read in the room. When staff need to keep an eye on several patients, the data they need is physically spread out.',
    approach: 'Integrate with the medical device to capture its output, stream it across the network in real time, and render it in a centralized interface that mirrors what the monitor shows.',
    architecture: 'A capture layer sits next to the monitor and reads its output. Data is streamed over the local network to a central application, which decodes and displays each monitor’s feed side by side.',
    challenges: [
      'Integrating with medical devices that expose data in different ways.',
      'Keeping latency low so the mirror matches the bedside display.',
      'Handling network interruptions without losing the stream.',
    ],
    results: 'A centralized software interface showing mirrored vital-monitor information streamed in real time.',
  },
  {
    key: 'rice',
    name: 'Rice Leaf Disease Detection',
    domain: 'Computer Vision',
    desc: 'Computer vision system for classifying rice leaf diseases using transfer learning.',
    problemShort: 'Identifying leaf disease by eye is slow and needs expertise that isn’t always in the field.',
    solutionShort: 'An image classifier comparing a custom CNN with MobileNetV2 and InceptionV3 backbones.',
    outcome: 'A side-by-side comparison of architectures, including lightweight MobileNetV2 for on-device use.',
    stack: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'CNN', 'MobileNetV2', 'InceptionV3'],
    flow: ['Leaf image', 'Preprocess', 'Backbone', 'Classifier', 'Disease label'],
    overview: 'A computer vision model that takes a photo of a rice leaf and predicts which disease, if any, is present. The project compares training a CNN from scratch with transfer learning from pretrained backbones.',
    problem: 'Rice leaf diseases look similar to an untrained eye, and expert diagnosis is not always available where crops are grown. Early identification depends on fast, accessible classification.',
    approach: 'Images are preprocessed and augmented with OpenCV and Keras utilities. A baseline CNN is trained, then MobileNetV2 and InceptionV3 are fine-tuned through transfer learning, and the models are evaluated against each other.',
    architecture: 'Input images are resized and normalised, passed through a pretrained convolutional backbone with frozen early layers, and finished with a classification head trained on the rice leaf classes.',
    challenges: [
      'Limited labelled images per disease class.',
      'Visually similar symptoms across different diseases.',
      'Balancing accuracy against model size for practical deployment.',
    ],
    results: 'Trained and compared CNN, MobileNetV2 and InceptionV3 classifiers on the same task, giving a clear basis for choosing a model for deployment.',
  },
  {
    key: 'rag',
    name: 'RAG Document Assistant',
    domain: 'Generative AI · RAG',
    desc: 'A document-based AI assistant that allows users to upload documents and ask questions using Retrieval-Augmented Generation.',
    problemShort: 'Answers are buried in long documents, and general LLMs can’t see private files.',
    solutionShort: 'Chunk and embed uploaded files, retrieve relevant passages and generate grounded answers.',
    outcome: 'Question-answering over a user’s own documents, grounded in retrieved context.',
    stack: ['Python', 'LangChain', 'Embeddings', 'Vector Search', 'LLM', 'RAG', 'Streamlit'],
    flow: ['Upload', 'Chunk', 'Embeddings', 'Vector search', 'LLM answer'],
    overview: 'Upload a PDF or document, then ask it questions in plain language. The assistant finds the passages that matter and uses an LLM to answer from them.',
    problem: 'Finding a specific answer in long documents is slow, and a general-purpose LLM has never seen the user’s files, so it either can’t answer or makes something up.',
    approach: 'Documents are split into chunks with LangChain, embedded, and stored in a vector index. At question time the most relevant chunks are retrieved and passed to the LLM as context, all behind a Streamlit interface.',
    architecture: 'Ingestion: load → split → embed → store in vector index. Query: embed question → similarity search → assemble prompt with retrieved chunks → LLM generates the answer → shown in Streamlit.',
    challenges: [
      'Choosing chunk sizes that keep context without diluting retrieval.',
      'Keeping answers grounded in the retrieved text.',
      'Handling documents with inconsistent formatting.',
    ],
    results: 'A working document assistant that answers questions from uploaded files using retrieval-augmented generation.',
  },
  {
    key: 'dsa',
    name: 'AI Data Science Assistant',
    domain: 'AI Agents · Analytics',
    desc: 'An intelligent assistant that helps users explore datasets, perform analysis, generate insights, and understand data.',
    problemShort: 'Exploratory analysis is repetitive, and non-technical users struggle to get insight from raw data.',
    solutionShort: 'An LLM agent that runs Pandas analysis, builds charts and explains findings in plain language.',
    outcome: 'A conversational way to explore a dataset and generate insights.',
    stack: ['Python', 'Pandas', 'LLMs', 'AI Agents', 'Data Visualization'],
    flow: ['Dataset', 'Agent plan', 'Pandas analysis', 'Visualization', 'Insights'],
    overview: 'Load a dataset and ask questions about it. The assistant decides what analysis to run, runs it, visualises the result and explains what it found.',
    problem: 'The first hours with any dataset are spent on the same steps: profiling, cleaning checks, summaries and basic charts. People without Python experience often can’t do this at all.',
    approach: 'An LLM-driven agent translates questions into analysis steps, executes them with Pandas, produces visualizations and summarises the outcome in plain language.',
    architecture: 'The dataset is loaded into a Pandas DataFrame. The agent plans a sequence of tool calls (inspect, compute, plot), executes them, observes results, and composes a final explanation with charts.',
    challenges: [
      'Keeping generated analysis correct and safe to execute.',
      'Explaining statistical results without overstating them.',
      'Handling messy, real-world datasets.',
    ],
    results: 'An assistant that takes a user from raw dataset to analysis, charts and written insights through conversation.',
  },
];

export interface JourneyItem {
  tag: string;
  title: string;
  org: string;
  text: string;
  /** Optional date range shown next to the tag, e.g. "Jul 2025 – Mar 2026". */
  period?: string;
  /** Optional supporting document or credential. */
  link?: { label: string; href: string };
}

export const journey: JourneyItem[] = [
  { tag: 'Foundation', title: 'BTech Computer Science & Engineering', org: 'Undergraduate degree', text: 'Algorithms, data structures, databases, networks and software engineering. The base everything else is built on.' },
  { tag: 'Training', title: 'Data Science Training', org: 'Applied data science', text: 'Statistics, EDA, feature engineering, class imbalance handling, and classical ML: logistic regression, decision trees, random forest, SVM and XGBoost.' },
  { tag: 'Training', title: 'AI Engineering Training', org: 'DataMites', text: 'Deep learning with TensorFlow and Keras, CNNs, transfer learning with MobileNetV2, InceptionV3 and EfficientNet, and generative AI.' },
  { tag: 'Certification', title: 'Google Advanced Data Analytics Certification', org: 'Google', text: 'Python for data analysis, statistical testing, regression and machine learning models, and communicating results.' },
  {
    tag: 'Internship',
    title: 'AI Engineer Intern',
    org: 'Rubixe.com',
    period: 'Jul 2025 – Mar 2026',
    text: 'Eight months on proof-of-concept projects, project-based assignments and client-oriented work: applying analytics to real business scenarios, interpreting data, surfacing insights and contributing to structured problem-solving within project teams.',
    link: { label: 'View experience letter', href: `${import.meta.env.BASE_URL}rubixe-internship-letter.pdf` },
  },
  { tag: 'Building', title: 'AI Projects / Product Development', org: 'Independent work', text: 'Applied systems across emergency response, healthcare, computer vision, RAG and data agents, including CareFirst AI and Vital Monitor Mirroring.' },
];

export const skillCategories = [
  { name: 'AI & Machine Learning', info: 'Supervised learning from linear models to boosted trees and neural networks.' },
  { name: 'Generative AI', info: 'LLM applications, retrieval, agents and voice interfaces.' },
  { name: 'Data Science', info: 'Getting data into shape and understanding it before modelling.' },
  { name: 'Computer Vision', info: 'Image classification with CNNs and pretrained backbones.' },
  { name: 'Programming', info: 'The languages behind the models and pipelines.' },
  { name: 'Data & Analytics', info: 'Dashboards, databases and reporting for decisions.' },
  { name: 'Tools & Platforms', info: 'Shipping, versioning and sharing the work.' },
];

export const skills: { name: string; category: string; info: string }[] = [
  { name: 'Python', category: 'Programming', info: 'Primary language for modelling, data pipelines and AI applications.' },
  { name: 'SQL', category: 'Programming', info: 'Querying, joining and aggregating relational data.' },
  { name: 'Scikit-learn', category: 'AI & Machine Learning', info: 'Logistic regression, decision trees, random forest and SVM, with pipelines and evaluation.' },
  { name: 'XGBoost', category: 'AI & Machine Learning', info: 'Gradient-boosted trees for strong results on tabular problems.' },
  { name: 'TensorFlow', category: 'AI & Machine Learning', info: 'Training and fine-tuning deep learning models.' },
  { name: 'Keras', category: 'AI & Machine Learning', info: 'High-level model building for CNNs and transfer learning.' },
  { name: 'Class Imbalance', category: 'AI & Machine Learning', info: 'Resampling and weighting strategies for skewed datasets.' },
  { name: 'LLMs', category: 'Generative AI', info: 'Building applications on large language models: prompting, extraction, classification.' },
  { name: 'LangChain', category: 'Generative AI', info: 'Orchestrating loaders, splitters, retrievers and chains.' },
  { name: 'RAG', category: 'Generative AI', info: 'Grounding LLM answers in retrieved documents via embeddings and vector search.' },
  { name: 'AI Agents', category: 'Generative AI', info: 'LLMs that plan and call tools to complete multi-step tasks.' },
  { name: 'Voice AI', category: 'Generative AI', info: 'Speech-to-text and text-to-speech for spoken interfaces.' },
  { name: 'Pandas', category: 'Data Science', info: 'Cleaning, reshaping and analysing tabular data.' },
  { name: 'NumPy', category: 'Data Science', info: 'Vectorised numerical computing.' },
  { name: 'EDA', category: 'Data Science', info: 'Profiling distributions, relationships and anomalies before modelling.' },
  { name: 'Feature Engineering', category: 'Data Science', info: 'Turning raw columns into signals models can learn from.' },
  { name: 'OpenCV', category: 'Computer Vision', info: 'Image loading, preprocessing and augmentation.' },
  { name: 'CNN', category: 'Computer Vision', info: 'Convolutional networks for image classification.' },
  { name: 'Transfer Learning', category: 'Computer Vision', info: 'Fine-tuning MobileNetV2, InceptionV3 and EfficientNet backbones.' },
  { name: 'Power BI', category: 'Data & Analytics', info: 'Interactive dashboards and business reporting.' },
  { name: 'MySQL', category: 'Data & Analytics', info: 'Relational database design and querying.' },
  { name: 'Streamlit', category: 'Tools & Platforms', info: 'Fast interfaces for ML models and AI assistants.' },
  { name: 'Git', category: 'Tools & Platforms', info: 'Version control for code and experiments.' },
  { name: 'GitHub', category: 'Tools & Platforms', info: 'Hosting, collaboration and sharing projects.' },
];

export const researchBoard = [
  {
    name: 'Reading',
    fill: 'transparent',
    items: [
      { title: 'Edge AI', text: 'Compact vision models that run on-device.' },
      { title: 'Multimodal AI', text: 'Combining vision, speech and text in one interface.' },
    ],
  },
  {
    name: 'Prototyping',
    fill: 'rgba(229, 32, 46,.35)',
    items: [
      { title: 'AI Agents', text: 'Planning, tool use and reliable hand-offs.' },
      { title: 'Real-time AI Systems', text: 'Streaming inference within tight latency budgets.' },
    ],
  },
  {
    name: 'Building',
    fill: '#e5202e',
    items: [
      { title: 'Voice AI', text: 'Speech-to-speech assistants for emergency use.' },
      { title: 'Healthcare AI', text: 'Monitoring and clinical data interfaces.' },
      { title: 'LLM Applications', text: 'Grounded assistants over documents and data.' },
    ],
  },
];

export interface Certificate {
  mono: string;
  kind: string;
  name: string;
  issuer: string;
  /** Leave empty to hide the year. */
  year: string;
  skills: string[];
  /** Credential URL. The "View Certificate" link only shows when set. */
  url?: string;
}

export const certificates: Certificate[] = [
  {
    mono: 'G',
    kind: 'Professional Certificate',
    name: 'Google Advanced Data Analytics Professional Certificate',
    issuer: 'Google',
    year: '',
    skills: ['Python', 'Statistics', 'Regression', 'Machine Learning', 'Data Visualization'],
  },
  {
    mono: 'DM',
    kind: 'Training',
    name: 'DataMites AI Engineering',
    issuer: 'DataMites',
    year: '',
    skills: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Generative AI', 'Python'],
  },
];

export const aboutDetails = [
  { key: 'education', value: 'BTech, Computer Science & Engineering' },
  { key: 'certified', value: 'Google Advanced Data Analytics' },
  { key: 'training', value: 'AI Engineering, DataMites' },
  { key: 'internship', value: 'AI Engineer Intern, Rubixe.com' },
  { key: 'focus', value: 'Applied AI products', accent: true },
];

export const heroTags = ['GenAI', 'RAG', 'Computer Vision', 'Voice AI', 'AI Agents'];
