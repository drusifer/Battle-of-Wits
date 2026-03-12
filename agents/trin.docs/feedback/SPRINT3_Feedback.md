Here are some Issues I found when manually testing the game:

1) We need an introdution to the game have gramps set the scene, breiefly explain the rules, and then jump into the dialogue with vinzini and the Dread Pirate Roberts.  
2) For some reason you have gramps asking the riddle and DPR responding Correct / incorrect.  It should actually be Vizzini asking the riddles and The player (as the DPR) providing the one word answers.  (remove common articles to make it easier ("a needle" should match "needle")
3) The goblet paragraphs need some work.  There are odd joining words and "The cup before you" starter is awkward.  The descrioptions should start "the cup on the left ..."  and then "the cup on the right", and variation there of.  write a test that generate a large number of descritve paragraphs and refine the fragments so the randomly generated Goblet descriptions sound natural.
4) The buttercup hits are revealing the cup, she should only give hits about the riddles until the cups are revealed and then hint about the goblets if asked.
5) There is no way to choose the cup of wine in the UX.  Add "I choose the goblent on the right" or "I choose the golet on the left" as buttons that the user can click to make their selection.

Reproduce these issues with tests and then fix the code so the tests pass.
