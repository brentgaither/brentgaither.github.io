---
layout: post
title: Needleman-Wunsch Algorithm
tags: [bioinformatics]
---

In the last post I explained a very simple way to compare DNA strands. Although this does give us an idea of how similar two sequences are it has some problems. If a deletion or insertion occurs in two places the sequences will not align correctly. If the sequences are similar in some sections but have large insertions or deletions the last program will fail to properly detect how they should align. We can see patterns quickly with small sequences but to be able to anaylze a real genome you need to use computers. We can use a global alignment to align DNA more reliabliy.
A global alignment will try to create the best alignment for the entire length of the DNA sequences. This might not be the best choice though if you believe you have a subsection of your DNA in the strand you are comparing it to. This is best for sequences that represent the whole portion of the same DNA you are look at for example an entire gene in a downy woodpecker and the gene in a red headed woodpecker. Remember though this does not tell us anything about function of the gene just the differences in nucleotides.

I used the same read in method as last time to get sequences into our program. Next I am going to build a matrix to hold all of the posible ways for the sequences to align. This creates a matrix that has all of the alignments of the DNA strands and creates possible gaps in the sequence. If a gap is created we use a gap score to penalize because this means our sequence does not align as close. 

```python
def buildGlobalMatrix(gap, misMatch, match, sequenceOne, sequenceTwo):
matrix = [[0 for col in range(len(sequenceTwo)+1)] 
  for row in range(len(sequenceOne)+1)]
  rowLength = len(sequenceOne)
  colLength = len(sequenceTwo)
  for i in range(1,rowLength+1): 
      matrix[i][0] = matrix[i-1][0]+int(gap)
      for j in range(1,colLength+1):
          matrix [0][j] = matrix[0][j - 1] + int(gap) 
          if (sequenceOne[i-1] == sequenceTwo[j - 1]):
              score1 = matrix[i - 1][j - 1] + int(match)
          else:
              score1 = matrix[i - 1][j - 1] + int(misMatch)
          score2 = matrix[i][j - 1] + int(gap)
          score3 = matrix[i - 1][j] + int(gap)
          matrix[i][j] = max(score1, score2, score3)

  return matrix
```

This next method is a bit hefty... To align the sequences we take in the matrix we just created then uses the gap score to see where gaps were placed. We start at the bottom right of the matrix and move to the top right to align the sequences. When nucleotides are aligned the matrix moves diagonally and horitonally or vertically when there are gaps in a sequence.

```python
def buildDirectional(matrix, rowLength, colLength, gapScore):
  directionalString = ''
  currentRow = rowLength
  currentCol = colLength
  while(currentRow != 0 or currentCol != 0):
      if(currentRow == 0):
          directionalString = directionalString + (('H') * currentCol)
          return directionalString
      elif(currentCol == 0):
          directionalString = directionalString + (('V') * currentRow)
          return directionalString
      elif(matrix[currentRow][currentCol - 1] + 
              int(gapScore) == matrix[currentRow][currentCol]):
          directionalString = directionalString + ('H')
          currentCol = currentCol - 1
      elif(matrix[currentRow - 1][currentCol] + 
              int(gapScore) == matrix[currentRow][currentCol]):
          directionalString = directionalString + ('V')
          currentRow = currentRow - 1
      else:
          directionalString = directionalString + ('D')
          currentRow = currentRow - 1
          currentCol = currentCol - 1
  return directionalString
```

  
To actually create the alignment these next two methods will take the directional string that was created and match the sequences together. The "-"s are just a way to see there is an insertion or deletion in one of the strands. The connector string makes the output a bit easier for us visually to understand how they align. 

```python
def buildAlignment(sequenceOne, sequenceTwo, directionalString):
  
  seq1Pos = len(sequenceOne)-1
  seq2Pos = len(sequenceTwo)-1
  dirPos = 0
  alignSeq1 = ''
  alignSeq2 = ''
  while(dirPos < len(directionalString)):
      
      if(directionalString[dirPos] == "D"): 
          alignSeq1 = sequenceOne[seq1Pos] + alignSeq1
          alignSeq2 = sequenceTwo[seq2Pos] + alignSeq2
          seq1Pos = seq1Pos - 1
          seq2Pos = seq2Pos - 1
      elif(directionalString[dirPos] == "V"):
          alignSeq1 = sequenceOne[seq1Pos] + alignSeq1
          alignSeq2 = '-' + alignSeq2
          seq1Pos = seq1Pos - 1
      else:
          alignSeq1 = '-' + alignSeq1 
          alignSeq2 = sequenceTwo[seq2Pos] + alignSeq2
          seq2Pos = seq2Pos -1
      dirPos = dirPos + 1
  alSeq1List = list(alignSeq1)
  alSeq2List = list(alignSeq2)

  connectors, alignmentScore = createConnections(alSeq1List, alSeq2List)

  return alignSeq1, alignSeq2, connectors, alignmentScore

def createConnections(alSeq1List, alSeq2List):

  connectors = ""
  alignmentScore = 0
  for char1, char2 in zip(alSeq1List, alSeq2List):
      if char1 == char2:
          connectors = connectors + "|"
          alignmentScore = alignmentScore + 1

      else:
          if char1 == "-" or char2 == "-":
              connectors = connectors + " "
          else:
              connectors = connectors + "."

  return connectors, alignmentScore
```

In my full project on github I have two other ways to align the sequences (locally and semi-globally). This last method just prints out the sequences nicely.


```python
def printAlignment(alignSeq1, alignSeq2, connectors):
  line = 0
  nucleotideCount = 1
  charPerLine = 50
  for line in range(line,len(alignSeq1),charPerLine):
      print(str(nucleotideCount) + " " + 
        alignSeq1[line:line + charPerLine])
      print(len(str(nucleotideCount)) + " " + " " + 
          connectors[line:line + charPerLine])
      print(str(nucleotideCount) + " " + 
        alignSeq2[line:line + charPerLine])
      nucleotideCount = nucleotideCount + charPerLine
```
