# RydeeNLP

## Abstract
Natural Language Processing (NLP) has significantly advanced language learning technologies, yet adaptive, personalized tools for less commonly taught languages like Japanese remain underdeveloped. Existing Japanese learning tools often lack dynamic adjustment to individual learners' evolving proficiency, making the learning process daunting. Addressing this gap, we present RydeeNLP, a novel Japanese language learning system that integrates advanced NLP techniques with educational technology to provide personalized learning experiences. Our contributions in this paper are three-fold. First, we employ a word-swapping model to create a multi-tiered difficulty classification system for Japanese vocabulary, covering nouns, verbs, and adjectives. Second, we develop custom difficulty and paraphrase dictionaries to inform adaptive translation models that dynamically adjust translations based on learner proficiency. Third, we implement this technology in a web browser extension that provides real-time, proficiency-matched translations and automatically populates a spaced repetition flashcard system for ongoing learning. Evaluation results demonstrate the effectiveness of our classifiers and translation models, with the fine-tuned model producing more grammatically accurate translations and word-swapping model translating with overall higher BLEU scores.

## What is RydeeNLP?
 a novel Japanese language learning system that integrates advanced NLP techniques with educational technology to provide personalized learning experiences. Our approach consists of three main components: Dictionaries, Translation Models, and a Web Browser Extension. These components work together to provide a comprehensive, personalized Japanese language learning experience.

### Translation
The translation feature generates multiple Japanese translations based on the user's selected proficiency level (Elementary, Middle, or High school). 
Users can set their preferred level to read Japanese texts that match their vocabulary skills.

### Web Browser Extention
Users can click on words in the generated translations that they are unfamiliar with or wish to remember. 
These words are automatically stored in the Anki flashcard app, eliminating the need for manual flashcard creation and helping users study Japanese more efficiently.


## How to use it
1. Select the translation level from ```[Elementary, Middle, High]``` based on the user's vocabulary level.
2. Enter the text and generate the translation.
3. The translation based on the user's school level will appear in the translation area.
4. Click on unfamiliar words to add them to the Flashcard section.
5. Click ```Generate Anki Deck``` to export the Anki file.
6. Import the Anki file into the Anki app.
7. Enjoy your study!!

※"vulnerble" in the sentence is translated in　脆弱(level: high), 弱い(level: elementary) in the GIF

![gif_rydeen](https://github.com/user-attachments/assets/1946e901-d866-4e5c-ac14-fda10decb5e9)


## Software
1. MeCab: An open-source text segmentation library for Japanese written text. It provides fast and accurate morphological analysis of Japanese sentences.
2. Jisho API: online Japanese-English dictionary Jisho.org. It allows developers to retrieve word definitions, readings, and example sentences programmatically.
3. Anki API:An API for the spaced repetition flashcard program Anki. It enables programmatic creation and management of flashcards and decks, facilitating integration with language learning applications.

