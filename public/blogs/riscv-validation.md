---
date: 06/30/2023
title: "Validating Hardware and SimPoints with gem5: A RISC-V Board Case Study"
tags:
- harshil
- shaadi.com
- divya
authors:
  - Kunal Pai
  - Jasonbhai Citruswala
image: /images/maa-ka-hahsiru.png
---

# Validating Hardware and SimPoints with gem5: A RISC-V Board Case Study

This directory contains all the resources used to present the poster titled "Validating Hardware and SimPoints with gem5: A RISC-V Board Case Study" by Kunal Pai, Zhantong Qiu and Jason Lowe-Power at the gem5 Workshop, located at ISCA 2023.

The patchset with the exact changes to the board can be found [here](https://gem5-review.googlesource.com/c/public/gem5/+/70798).

At a high level, here are the changes made to the RISCVMatched's config:

- The RISCVMatched Cache Hierarchy is changed to private L1 shared L2.
- The RISCVMatched Core's parameters are changed to better match hardware performance.

    All the changes that deviate from the datasheet and the [ARM HPI CPU](https://github.com/arm-university/arm-gem5-rsk/blob/master/gem5_rsk_gem5-21.2.pdf) (reference for pipeline parameters) are documented.

    The core parameters that are changed are:

    - threadPolicy:
        This is initialized to "SingleThreaded".
    - decodeToExecuteForwardDelay:
        This is changed from 1 to 2 to avoid a PMC address fault.
    - fetch1ToFetch2BackwardDelay:
        This is changed from 1 to 0 to better match hardware performance.
    - fetch2InputBufferSize:
        This is changed from 2 to 1 to better match hardware performance.
    - decodeInputBufferSize:
        This is changed from 3 to 2 to better match hardware performance.
    - decodeToExecuteForwardDelay:
        This is changed from 2 to 1 to better match hardware performance.
    - executeInputBufferSize:
        This is changed from 7 to 4 to better match hardware performance.
    - executeMaxAccessesInMemory:
        This is changed from 2 to 1 to better match hardware performance.
    - executeLSQStoreBufferSize:
        This is changed from 5 to 3 to better match hardware performance.
    - executeBranchDelay:
        This is changed from 1 to 2 to better match hardware performance.
    - enableIdling:
        This is changed to False to better match hardware performance.
    - MemReadFU: changed to 2 cycles from 3 cycles.

    The changes in the branch predictor are:

    - BTBEntries:
    This is changed from 16 entries to 32 entries.
    - RASSize:
    This is changed from 6 entries to 12 entries.
    - IndirectSets:
    This is changed from 8 sets to 16 sets.
    - localPredictorSize:
    This is changed from 8192 to 16384.
    - globalPredictorSize:
    This is changed from 8192 to 16384.
    - choicePredictorSize:
    This is changed from 8192 to 16384.
    - localCtrBits:
    This is changed from 2 to 4.
    - globalCtrBits:
    This is changed from 2 to 4.
    - choiceCtrBits:
    This is changed from 2 to 4.
