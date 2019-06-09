---
layout: post
title: Aligning DNA
categories: [bioinformatics]
---

This first program is here to show how easy it is to start learning about bioinformatics using python. This program
quickly anaylzes two strings or DNA strands to see how similar they are. This even includes a few additional features
for alignment style and direction. This does not however take into account all of the factors that a real DNA strand will encounter.
I started with a simple method to read in a <a href ="https://en.wikipedia.org/wiki/FASTA_format">FASTA</a> formatted file. This is used in most of my programs since FASTA files are a standard.



```python
def readInFile(infile): \n
    sequence = "" 
    infile.readline()  # bypass > header line
    for line in infile:
        line = line.replace('\n', '')
        sequence = sequence + line
        sequence = sequence.upper()
    infile.close()
    return sequence
```


  This next method comapres two sequences with the same length. This is a rather crude way to compare DNA sequences but to start to learn how to use python in biology this works.

```python
def comparison(seq1,seq2):
        
    counterComp = 0 

    for iterator in range(0,len(seq1)):
        #find matching nucleotides and add total 
        if(seq1[iterator] == seq2[iterator]):
             counterComp += 1
    if(counterComp == 0):
        print ("no mismatches found - sequences are identical")
    else:        
        print(seq1)
        print(seq2)
        print("Sequences are identical length with " + str(counterComp) 
            + " matches out of " + str(len(seq1)) + " nucleotides")
```

   We can now input a FASTA file and compare sequences with this method. What happens if we have sequences of different lengths? We can use this method below to try and predict where the sequences might line up.

```python
def comparisonUnequal(seq1,seq2):
    difference = 0
    deletion =''

    bestFit = list('')
    counter = 0
    if(len(seq1) < len(seq2)):
        seq1, seq2 = switchSequences(seq1,seq2)

    difference = len(seq1) - len(seq2)
    shortSeq = len(seq2)

    #create spaces for deletion
    for i in range(0,difference):
        deletion = deletion + '-'   

    #iterate through sequence moving deletion down each nucleotide
    for iterator in range(0,shortSeq+1):
        counter = 0 #resets counter to 0
        newSeq2 = seq2[0:iterator] + deletion + seq2[iterator:shortSeq] 
        #count number of matching nucleotides put in list
        for i in range(0,shortSeq+1):
            if seq1[i] == newSeq2[i]:
                counter = int(counter)+ 1
        bestFit.append(int(counter))
    print("The best matching sequence is...")
    print(seq1)
    print(seq2[0:bestFit.index(max(bestFit))] + deletion + 
        seq2[bestFit.index(max(bestFit)):shortSeq])
    print("There are " + str(max(bestFit)) + " matching nucleotides")
    print("A deletion of " + str(difference) + 
        " nucleotide(s) occurred at nucleotide(s) " 
        + str(bestFit.index(max(bestFit))+1) + "-"+ 
        str(bestFit.index(max(bestFit))+difference))
```
I also added in a method to ensure that I knew which DNA strand was longer. This helps me ensure i have a positive number when determining how many nucleotides are missing or inserted between the two sequences. 

```python
  def switchSequences(seq1,seq2):
      temp = seq1
      seq1 = seq2
      seq2 = temp
      return seq1, seq2
```
