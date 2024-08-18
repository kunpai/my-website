---
date: 08/15/2024
title: "Potential and Limitation of High-Frequency Cores and Caches"
tags:
    - simulation
    - cryogenic computing
    - superconducting electronics
authors:
    - Kunal Pai
    - Anusheel Nand
    - Jason Lowe-Power
---

<button onclick="location.href='https://arch.cs.ucdavis.edu/assets/papers/arxiv24-potentialhighfreq.pdf'" class="btn btn-outline-secondary">Local Download</button>
<button onclick="location.href='https://arxiv.org/abs/2408.03308'" class="btn btn-outline-secondary">arXiv Link</button>
<button onclick="location.href='https://arch.cs.ucdavis.edu/assets/papers/modsim2024-potentialhighfreq-poster.pdf'" class="btn btn-outline-secondary">Poster Download</button>
<button onclick="location.href='https://arch.cs.ucdavis.edu/assets/papers/modsim2024-potentialhighfreq-presentation.pdf'" class="btn btn-outline-secondary">Presentation Download</button>

This paper explores the potential of cryogenic computing and superconducting electronics as promising alternatives to traditional semiconductor devices. As semiconductor devices face challenges such as increased leakage currents and reduced performance at higher temperatures, these novel technologies offer high performance and low power computation. Cryogenic computing operates at ultra-low temperatures near 77 K, leading to lower leakage currents and improved electron mobility. On the other hand, superconducting electronics, operating near 0 K, allow electrons to flow without resistance, offering the potential for ultra-low-power, high-speed computation. This study presents a comprehensive performance modeling and analysis of these technologies and provides insights into their potential benefits and limitations. We implement models of in-order and out-of-order cores operating at high clock frequencies associated with superconducting electronics and cryogenic computing in gem5. We evaluate the performance of these components using workloads representative of real-world applications like NPB, SPEC CPU2006, and GAPBS. Our results show the potential speedups achievable by these components and the limitations posed by cache bandwidth. This work provides valuable insights into the performance implications and design trade-offs associated with cryogenic and superconducting technologies, laying the foundation for future research in this field using gem5.

## Citation

Kunal Pai, Anusheel Nand, Jason Lowe-Power, "Potential and Limitations of High-Frequency Cores and Caches," arXiv preprint arXiv:2408.03308, 2024. doi: 10.48550/arXiv.2408.03308.

```python
@misc{pai2024potentiallimitationhighfrequencycores,
      title={Potential and Limitation of High-Frequency Cores and Caches},
      author={Kunal Pai and Anusheel Nand and Jason Lowe-Power},
      year={2024},
      eprint={2408.03308},
      archivePrefix={arXiv},
      primaryClass={cs.AR},
      url={https://arxiv.org/abs/2408.03308},
}
```
