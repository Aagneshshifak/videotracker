import { db } from "../server/db";
import { videos } from "../shared/schema";

const videoData = [
  // 1.1 Python for DataScience
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 1, title: "Introduction of Python.mp4" },
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 2, title: "DataTypes.mp4" },
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 3, title: "Operators.mp4" },
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 4, title: "Typecasting.mp4" },
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 5, title: "Strings.mp4" },
  { folder: "1.1 Python for DataScience", folderOrder: 1, videoOrder: 6, title: "Variables.mp4" },

  // 1.2. Conditionals and Flow Controls
  { folder: "1.2 Conditionals and Flow Controls", folderOrder: 2, videoOrder: 1, title: "If-else.mp4" },
  { folder: "1.2 Conditionals and Flow Controls", folderOrder: 2, videoOrder: 2, title: "for-loop.mp4" },
  { folder: "1.2 Conditionals and Flow Controls", folderOrder: 2, videoOrder: 3, title: "while-loop.mp4" },

  // 1.3. Data Structures
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 1, title: "Why do we need Data Structures?" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 2, title: "List" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 3, title: "Multi Dimensional List" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 4, title: "List Comprehension" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 5, title: "Dictionary" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 6, title: "Multi-Dimensional Dictionary" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 7, title: "Dictionary Comprehension" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 8, title: "Set and Tuples" },
  { folder: "1.3 Data Structures", folderOrder: 3, videoOrder: 9, title: "How to decide a Data Structure for a problem" },

  // 1.4. Function and OOPS
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 1, title: "Functions" },
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 2, title: "Modules" },
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 3, title: "Important Inbuild Libraries" },
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 4, title: "Understanding Classes and Objects" },
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 5, title: "Methods.mp4" },
  { folder: "1.4 Function and OOPS", folderOrder: 4, videoOrder: 6, title: "Classes with Module.mp4" },

  // 1.5. Special Functions
  { folder: "1.5 Special Functions", folderOrder: 5, videoOrder: 1, title: "Zip, Filter, Lambda and Map" },
  { folder: "1.5 Special Functions", folderOrder: 5, videoOrder: 2, title: "ASCII Code" },

  // 1.6. Exceptions
  { folder: "1.6 Exceptions", folderOrder: 6, videoOrder: 1, title: "Understanding Errors.mp4" },
  { folder: "1.6 Exceptions", folderOrder: 6, videoOrder: 2, title: "Handling the Exception.mp4" },

  // 2.1 Basic Probability for Data Science
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 1, title: "Introduction to Probabilities" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 2, title: "Rules of Probability" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 3, title: "Random experiments, sample space and events" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 4, title: "Permutation and Combinations" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 5, title: "Union and Intersection, Venn Diagram.mp4" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 6, title: "Joint and Conditional Probability.mp4" },
  { folder: "2.1 Basic Probability for Data Science", folderOrder: 7, videoOrder: 7, title: "Bayes's Theorem.mp4" },

  // 2.2 Fundamentals of Statistics
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 1, title: "Introduction of Statistics.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 2, title: "Data.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 3, title: "Frequency.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 4, title: "Measure of central Tendency.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 5, title: "Measure of Dispersion.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 6, title: "Measure of Relative Dispersion.mp4" },
  { folder: "2.2 Fundamentals of Statistics", folderOrder: 8, videoOrder: 7, title: "Measure of Shape.mp4" },

  // 2.3 Probability Distribution
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 1, title: "Introduction to Probability Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 2, title: "Uniform Discrete Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 3, title: "Bernoulli Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 4, title: "Binomial Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 5, title: "Poisson Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 6, title: "Continuous Uniform Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 7, title: "Exponential Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 8, title: "Normal Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 9, title: "Standard Normal Distribution.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 10, title: "Normalization.mp4" },
  { folder: "2.3 Probability Distribution", folderOrder: 9, videoOrder: 11, title: "T Distribution.mp4" },

  // 2.4 Inferential Statistics
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 1, title: "Population and Sample.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 2, title: "Central Limit Theorem.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 3, title: "Confidence Interval Part -1.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 4, title: "Confidence Interval Part -2.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 5, title: "Hypothesis Testing.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 6, title: "Z Test Two Tailed.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 7, title: "Z Test one Tailed.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 8, title: "T-Test.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 9, title: "T-Test(Continued).mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 10, title: "Chi squared test.mp4" },
  { folder: "2.4 Inferential Statistics", folderOrder: 10, videoOrder: 11, title: "Chi square test for feature selection.mp4" },

  // 3.1 Getting started with Pandas
  { folder: "3.1 Getting started with Pandas", folderOrder: 11, videoOrder: 1, title: "Getting Started with Pandas.mp4" },
  { folder: "3.1 Getting started with Pandas", folderOrder: 11, videoOrder: 2, title: "Dataset Walkthrough.mp4" },

  // 3.2 Data Preprocessing with Google Playstore
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 1, title: "Data preprocessing - Removing Null value rows.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 2, title: "Data Analysis Numeric.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 3, title: "Data Analysis Categorical.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 4, title: "Data Analysis Automatic Categorical.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 5, title: "Null Values Handling Numeric.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 6, title: "Null Values Handling Categorical.mp4" },
  { folder: "3.2 Data Preprocessing with Google Playstore", folderOrder: 12, videoOrder: 7, title: "Null Values Handling in Google Playstore Dataset.mp4" },
];

async function addAllVideos() {
  try {
    console.log(`Adding ${videoData.length} videos to the database...`);
    
    for (const video of videoData) {
      await db.insert(videos).values(video);
      console.log(`✓ Added: ${video.folder} - ${video.title}`);
    }
    
    console.log('\n✅ Successfully added all videos!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding videos:', error);
    process.exit(1);
  }
}

addAllVideos();
