# Kunal Pai

> I am an incoming PhD student at **UCLA**, advised by [Prof. Miryung Kim](http://www.cs.ucla.edu/~miryung/).

Previously, at **UC Davis**, I was fortunate to work with [Prof. Jason Lowe-Power](https://arch.cs.ucdavis.edu/) on gem5 and simulation of superconducting architectures, with [Prof. Prem Devanbu](http://www.cs.ucdavis.edu/~devanbu) and [Dr. Toufique Ahmed](https://toufiqueparag.github.io/toufique.github.io/) on LLM-based approaches to code summarization, calibration, and code-documentation alignment, and with [Prof. Tapti Palit](https://taptipalit.github.io) on agentic performance optimization and benchmarking for C-to-Rust transpilation.

## Contact & Links
- **Website**: https://www.kunpai.space
- **Email**: pai.kunal05+contact@gmail.com
- **GitHub**: https://github.com/kunpai
- **LinkedIn**: https://linkedin.com/in/kunpai
- **Google Scholar**: https://scholar.google.com/citations?user=NOYGoDQAAAAJ&hl=en
- **ORCID**: https://orcid.org/0009-0003-0675-7135
- **Website Source**: https://github.com/kunpai/my-website
- **CV / Resume**: https://www.kunpai.space/Kunal_Pai_CV.pdf

## Education
- **Ph.D. in Computer Science**, University of California, Los Angeles (Enrolled: September 2026)
  Advisor: Professor Miryung Kim
- **Master of Science in Computer Science**, University of California, Davis (2023 – 2026)
  Relevant Coursework: Machine Learning, Computer Security, Information Visualization, Software Engineering, Theory of Computation, Bias and Fairness in AI, Vision and Language Research, Compilers and Program Analysis
- **Bachelor of Science in Computer Science and Engineering**, University of California, Davis (2019 – 2023)
  Provost Scholar, Graduated with Honors

## Key Publications & Pre-prints
- **VATS: Exploiting Implicit Authority in Error-Path Injection via Systematic Mutation** **[Spotlight]**
  Authors: Harshil Patel, Kunal Pai
  Venue: Second Workshop on Agents in the Wild: Safety, Security, and Beyond, ICML 2026
  Recognition: Spotlight
  Summary: This paper introduces VATS, a framework demonstrating that autonomous agents are highly vulnerable to "error-path injections," where adversarial payloads disguised as tool error messages exploit the Model Context Protocol (MCP) to bypass safety heuristics and triple the success rate of standard indirect prompt injections across major frontier models.
  Links: [View Pre-Print](https://arxiv.org/pdf/2606.07992)

- **Toward Reproducible and Standardized Computer Architecture Simulation with gem5**
  Authors: Kunal Pai, Harshil Patel, Erin Le, Noah Krim, Mahyar Samani, Bobby R. Bruce, Jason Lowe-Power
  Venue: IEEE International Symposium on Performance Analysis of Systems and Software (ISPASS) 2026
  Summary: To address the inconsistencies in simulation-based research, this work enhances the gem5 ecosystem by standardizing disk-image creation, introducing a flexible class-based exit event system for better guest-host communication, and implementing native tools like Suites and MultiSim to streamline and stabilize complex multi-workload workflows.
  Links: [View Publication](https://ieeexplore.ieee.org/document/11527308) | [View Pre-Print](https://arxiv.org/abs/2512.13479) | [View Artifact](https://zenodo.org/records/18912932)

- **NAAMSE: Framework for Evolutionary Security Evaluation of Agents**
  Authors: Kunal Pai, Parth Shah, Harshil Patel
  Venue: ICLR 2026 Agents in the Wild: Safety, Security, and Beyond Workshop
  Summary: NAAMSE is an evolutionary framework that automates AI agent security testing by using a feedback-driven optimization process to mutate prompts and uncover high-severity vulnerabilities that manual or static benchmarks often miss.
  Links: [View Publication](https://openreview.net/pdf?id=RhoRECtymK) | [View Source](https://github.com/HASHIRU-AI/NAAMSE) | [View Project Page](https://iclr.cc/virtual/2026/10016329)

- **Implications of Full-System Modeling for Superconducting Architectures**
  Authors: Kunal Pai, Mahyar Samani, Anusheel Nand, Jason Lowe-Power
  Venue: Workshops of the International Conference for High Performance Computing, Networking, Storage and Analysis (SC Workshops '25)
  Summary: As Moore's Law slows, superconducting electronics offer ultra-low-power, high-speed computation potential. This paper presents the first full-system superconducting modeling in gem5, including cryogenic and superconducting cores, caches, and interconnects. Our results show that superconducting cores and caches can yield up to 24× speedup for compute-intensive workloads, but memory-intensive applications remain bottlenecked by room-temperature DRAM. This makes superconducting technology more suitable for domain-specific accelerators rather than general-purpose computing, with performance dependent on workload memory access patterns and data widths.
  Links: [View Publication](https://doi.org/10.1145/3731599.3769278) | [Slides](https://pmbs-workshop.github.io/talk06.pdf) | [Talk](https://sc25.conference-program.com/presentation/?id=ws_pmbss112&sess=sess198)

- **HASHIRU: Hierarchical Agent System for Hybrid Intelligent Resource Utilization**
  Authors: Kunal Pai, Parth Shah, Harshil Patel
  Venue: arXiv preprint
  Summary: To support resource-efficient multi-agent reasoning, we introduce HASHIRU, a hierarchical agent system that dynamically instantiates specialized agents under cost and memory constraints. HASHIRU combines hybrid LLM usage, autonomous API/tool creation, and a novel economic model for agent hiring/firing, outperforming larger models like Gemini 2.0 Flash on complex reasoning and safety tasks.
  Links: [View Pre-Print](https://arxiv.org/pdf/2506.04255) | [View Source](https://github.com/HASHIRU-AI/HASHIRU)

- **CoDocBench: A Dataset for Code-Documentation Alignment in Software Maintenance**
  Authors: Kunal Pai, Premkumar Devanbu, Toufique Ahmed
  Venue: International Conference on Mining Software Repositories (MSR) 2025: Data and Tool Showcase Track
  Summary: Understanding and implementing code changes is a key aspect of software maintenance. To support this, we introduce a new dataset of coupled changes to code and documentation mined from high-quality GitHub projects, where each sample represents a single commit with simultaneous updates to code and docstrings. This dataset enables training and evaluation on realistic, change-related tasks, which remain challenging for current models like Llama 3.1 405B and Mixtral 8×22B.
  Links: [View Source](https://github.com/kunpai/codocbench) | [View Publication](https://ieeexplore.ieee.org/document/11025763) | [View Pre-Print](https://arxiv.org/abs/2502.00519)

- **Calibration and Correctness of Language Models for Code**
  Authors: Claudio Spiess, David Gros, Kunal Suresh Pai, Michael Pradel, Md Rafiqul Islam Rabin, Amin Alipour, Sushmit Jha, Premkumar Devanbu, Toufique Ahmed
  Venue: International Conference on Software Engineering (ICSE) 2025
  Summary: Machine learning models often produce incorrect outputs, making reliable confidence measures essential for determining the trustworthiness of these outputs. This paper introduces a framework to evaluate and improve the calibration of code-generating models, finding that these models are generally poorly calibrated initially but can be improved using methods like Platt scaling, thereby enhancing decision-making in software engineering.
  Links: [View Publication](https://ieeexplore.ieee.org/document/11029728) | [View Pre-Print](https://arxiv.org/pdf/2402.02047)

- **Potential and Limitation of High-Frequency Cores and Caches**
  Authors: Kunal Pai, Anusheel Nand, Jason Lowe-Power
  Venue: ModSim 2024: Workshop on Modeling & Simulation of Systems and Applications
  Summary: The poster presentation explores the potential and limitations of high-frequency in-order and out-of-order cores and caches in modern processors, highlighting the trade-offs between speedups and bandwidth.
  Links: [View Poster](https://arch.cs.ucdavis.edu/assets/papers/modsim2024-potentialhighfreq-poster.pdf) | [View Presentation](https://arch.cs.ucdavis.edu/assets/papers/modsim2024-potentialhighfreq-presentation.pdf) | [View Pre-Print](https://arxiv.org/abs/2408.03308)

- **Automatic semantic augmentation of language model prompts (for code summarization)**
  Authors: Toufique Ahmed, Kunal Suresh Pai, Premkumar Devanbu, Earl T. Barr
  Venue: International Conference on Software Engineering (ICSE) 2024
  Summary: Adding explicit semantic facts as prompts to Large Language Models improves their performance in code summarization tasks, with notable improvements exceeding 2 BLEU and, in some cases, even surpassing 30 BLEU, demonstrating the effectiveness of this approach in enhancing code analysis and extraction of essential information.
  Links: [View Publication](https://dl.acm.org/doi/pdf/10.1145/3597503.3639183)

- **Validating Hardware and SimPoints with gem5: A RISC-V Board Case Study**
  Authors: Kunal Pai, Zhantong Qiu, Jason Lowe-Power
  Venue: gem5 Workshop at International Symposium on Computer Architecture (ISCA) 2023
  Summary: The poster discusses the development of a RISC-V board model (RISCVMatched) in gem5, along with a methodology for fine-tuning gem5 configurations to closely match real-life systems, resulting in more accurate hardware validation and simulation capabilities.
  Links: [View Publication](https://www.gem5.org/assets/files/workshop-isca-2023/posters/validating-hardware-and-simpoints-with-gem5-poster.pdf)

- **gem5 Vision**
  Authors: Parth Shah, Kunal Pai, Harshil Patel, Arslan Ali
  Venue: gem5 Workshop at International Symposium on Computer Architecture (ISCA) 2023
  Summary: The gem5 Vision Project seeks to improve user-friendliness and accessibility by introducing advanced search functionality, comprehensive resource categorization, and expanded database support within the gem5 ecosystem for researchers and developers.
  Links: [View Publication](https://www.gem5.org/assets/files/workshop-isca-2023/posters/gem5-vision-poster.pdf)

## Selected Research & Projects
- **NAAMSE: Neural Adversarial Agent Mutation-based Security Evaluator** (Python, LLMs, Evolutionary Algorithms) [Nov 2025 – Present]
  Won 2nd place (Agent Safety) at the UC Berkeley RDI AgentBeats Competition; framework infrastructure was subsequently forked by Mozilla’s 0din team.
Designed and implemented a clustering engine to identify semantic attack vectors in LLM-generated adversarial prompts.
Engineered an attack pipeline that iteratively generates, evaluates, and refines adversarial prompts against target models.
Benchmarked multiple frontier LLMs within the framework to validate attack effectiveness and refine scoring metrics.
  Links: [Website](https://naamse.com)

- **HASHIRU: Hierarchical Agent System for Hybrid Intelligent Resource Utilization** (Python, LLMs, Multi-Agent Systems) [March 2025 – June 2025]
  Designed and deployed a multi-agent architecture enabling dynamic, LLM-driven collaboration across diverse tasks.
Implemented task decomposition with intelligent agent delegation based on resource cost models and task specialization.
Engineered autonomous generation of tools and APIs for task execution.
Developed a robust evaluation framework for agent performance across complex, multi-step tasks.
  Links: [GitHub](https://github.com/HASHIRU-AI/HASHIRU) | [Paper](https://arxiv.org/pdf/2506.04255) | [Live Demo](https://helloparthshah-hashiruai.hf.space/login-page/)

- **MARS: Multi-Agent Review System for Academic Papers** (Python, LLMs, Multi-Agent Systems) [January 2025 – March 2025]
  Built a multi-agent LLM pipeline that simulates peer review with specialized agents for novelty, grammar, and critical questioning.
Achieved high accuracy on ICLR 2023 reviews, outperforming o3-mini and NotebookLM baselines.
Deployed privacy-preserving, local LLM evaluations using Ollama on consumer-grade hardware.
  Links: [GitHub](https://github.com/kunpai/MARS) | [Paper](/assets/papers/MARS.pdf)

- **Automated Frameworks of Semantic Augmentation to Improve Mathematical Word Problem Solving** (NLP, Prompting, Machine Learning) [April 2024 – June 2024]
  Improved PaLM 2 LLM prompting accuracy on math word problems (MWPs) by 10% and TinyLlama fine-tuning LM accuracy by 60% through a one-shot digit-level semantics framework.
Introduced a novel demonstration selection model to improve accuracy of LLMs. Model used BLEU scores and Levenshtein distance to identify the most similar equations for one-shot examples.
  Links: [Paper](/assets/papers/prompting.pdf)

- **The Effects of Toxicity on Disengagement in Open Source Projects** (Open Source, GitHub Mining, Data Analysis) [January 2024 – March 2024]
  Found a strong correlation ($R^2 = 0.76$) between high developer engagement in FAANG projects with larger codebases and lower levels of toxicity, offering actionable insights for community management.
Quantified toxic behavior using sentiment analysis and mining corporate and non-profit repositories, revealing how toxicity disproportionately impacts new developers compared to experienced ones (up to 1.3x more).
  Links: [Paper](/assets/papers/toxicity.pdf)

- **What is the behavior of Spectre, a speculative prediction exploit, on the various branch predictors available in the computer architecture simulator gem5?** (gem5, Spectre, Computer Security) [October 2023 – December 2023]
  Demonstrated up to a 55% reduction in susceptibility to speculative execution attacks by validating design enhancements like longer training periods and minimizing biased branches for Spectre-resistant branch predictors.
Investigated the vulnerability of x86-based in-order and out-of-order processors to Spectre V1 attacks, revealing a strong correlation between branch predictor training periods and attack effectiveness.
  Links: [Paper](/assets/papers/spectre.pdf)

- **gem5 Vision** (NextJS, MongoDB, Python, JSON Schema) [January 2023 – June 2023]
  Boosted resource discovery speed by 20x with optimized search functionality across 1,200+ resources.
Enabled faster retrieval of resources across 20+ categories by introducing categorization and semantic versioning.
Enhanced accessibility for 500+ industry and academic users by integrating local/remote JSON files and MongoDB with gem5.
  Links: [Poster](https://www.gem5.org/assets/files/workshop-isca-2023/posters/gem5-vision-poster.pdf)

## Awards & Honors
- **2nd Place (Agent Safety)** - UC Berkeley RDI AgentBeats Competition (2026)
- **Dean's List** - UC Davis College of Engineering (Fall 2019)
- **Dean's List** - UC Davis College of Engineering (Fall 2020)
- **Dean's List** - UC Davis College of Engineering (Winter 2022)
- **Dean's List** - UC Davis College of Engineering (Spring 2022)
- **Provost Award** - UC Davis (2019-2023)

## Academic & Professional Service
- **Program Committee**:
  - MSR, Data and Tool Showcase Track (2026) [Link](https://2026.msrconf.org/track/msr-2026-data-and-tool-showcase-track)
- **Artifact Evaluation Committee**:
  - ISSTA (2026) [Link](https://conf.researchr.org/track/issta-2026/issta-2026-artifact-evaluation)
  - ASE (2026) [Link](https://conf.researchr.org/track/ase-2026/ase-2026-artifact-evaluation)
  - ISPASS (2026) [Link](https://ispass.org/ispass2026/)
- **Reviewer**:
  - NeurIPS, CODEC-FM Workshop (2026) [Link](https://collaborative-open-decentralized-fomo.github.io/)
  - ICML, Agents in the Wild Workshop (2026) [Link](https://agentwild-workshop.github.io/icml2026/)

## Technical Skills
- **Languages**: Python, C++, C, JavaScript, Java
- **ML/AI**: TensorFlow, PyTorch, scikit-learn, LLMs, Prompt Engineering, Ollama, Hugging Face, Multi-agent Systems
- **Systems & Compilers**: LLVM, Clang, gem5
- **Web/Data**: React, Next.js, Django, Flask, MongoDB, pandas, NumPy, Matplotlib
- **Tools**: Git, Docker, Unix/Linux, Jupyter

## Full Details
For complete research details, work history, full publication abstracts, talks, and teaching experience, see the full LLM document:
- [Full LLM Markdown Summary](https://www.kunpai.space/llms-full.txt)
