/**
 * CandidAI - Resume Parser Service
 * Parses resume files (PDF, DOCX) and extracts structured information
 */

/**
 * Resume Parser class
 * Handles parsing of resume files and extraction of key information
 */
class ResumeParser {
  constructor() {
    this.initialized = false;
    this.supportedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];

    // Common section headers in resumes
    this.sectionHeaders = {
      summary: ['summary', 'professional summary', 'profile', 'about me', 'objective', 'career objective'],
      experience: ['experience', 'work experience', 'employment history', 'work history', 'professional experience'],
      education: ['education', 'educational background', 'academic background', 'academic history'],
      skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'competencies'],
      certifications: ['certifications', 'certificates', 'professional certifications'],
      projects: ['projects', 'personal projects', 'key projects'],
      languages: ['languages', 'language proficiency'],
      interests: ['interests', 'hobbies', 'activities']
    };
  }

  /**
   * Initialize the parser
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    console.log('Resume Parser initialized');
    this.initialized = true;
    return true;
  }

  /**
   * Check if a file type is supported
   * @param {string} fileType - MIME type of the file
   * @returns {boolean} - Whether the file type is supported
   */
  isFormatSupported(fileType) {
    return this.supportedFormats.includes(fileType);
  }

  /**
   * Parse a resume file
   * @param {ArrayBuffer} fileContent - Content of the resume file
   * @param {string} fileType - MIME type of the file
   * @returns {Promise<Object>} - Parsed resume data
   */
  async parseResume(fileContent, fileType) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isFormatSupported(fileType)) {
      throw new Error(`Unsupported file format: ${fileType}`);
    }

    console.log(`Parsing resume of type: ${fileType}`);

    try {
      // Extract text based on file type
      let extractedText = '';

      if (fileType === 'application/pdf') {
        extractedText = await this.parsePdf(fileContent);
      } else if (fileType.includes('word')) {
        extractedText = await this.parseDocx(fileContent);
      }

      // Extract sections from text
      const sections = await this.extractSections(extractedText);

      // Extract contact information
      const contact = this.extractContactInfo(extractedText);

      return {
        parsed: true,
        format: fileType,
        sections: {
          ...sections,
          contact
        },
        rawText: extractedText
      };
    } catch (error) {
      console.error('Error parsing resume:', error);

      // Return a fallback result with the error
      return {
        parsed: false,
        format: fileType,
        error: error.message,
        sections: this.getFallbackSections(),
        rawText: ''
      };
    }
  }

  /**
   * Parse a PDF file to extract text
   * @param {ArrayBuffer} fileContent - The PDF file content
   * @returns {Promise<string>} - Extracted text
   * @private
   */
  async parsePdf(fileContent) {
    // In a real implementation, we would use PDF.js to parse the PDF
    // For now, we'll simulate PDF parsing with a delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return a simulated extracted text
    return `
JOHN DOE
Software Engineer
john.doe@example.com | (555) 123-4567 | New York, NY | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development, cloud technologies, and agile methodologies. Passionate about creating scalable, efficient solutions to complex problems.

EXPERIENCE
Senior Software Engineer
Tech Innovations Inc., New York, NY
January 2020 - Present
• Led development of a microservices architecture that improved system reliability by 35%
• Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 40%
• Mentored junior developers and conducted code reviews to ensure code quality
• Technologies: React, Node.js, TypeScript, AWS, Docker, Kubernetes

Software Engineer
Digital Solutions LLC, San Francisco, CA
June 2017 - December 2019
• Developed RESTful APIs for mobile and web applications
• Optimized database queries, resulting in 50% faster response times
• Collaborated with UX designers to implement responsive UI components
• Technologies: JavaScript, Express.js, MongoDB, Redis, Git

EDUCATION
Bachelor of Science in Computer Science
University of Technology, Boston, MA
2013 - 2017
• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development

SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java, SQL
• Frontend: React, Redux, HTML5, CSS3, SASS
• Backend: Node.js, Express, Django, Spring Boot
• Databases: MongoDB, PostgreSQL, MySQL, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform
• Tools: Git, JIRA, Confluence, Postman

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• MongoDB Certified Developer
• Certified Scrum Master (CSM)

PROJECTS
Personal Portfolio Website
• Designed and developed a responsive portfolio website using React and Gatsby
• Implemented a headless CMS for content management
• Deployed using Netlify with continuous deployment

Inventory Management System
• Built a full-stack inventory management system for small businesses
• Implemented user authentication, role-based access control, and real-time updates
• Technologies: MERN stack (MongoDB, Express, React, Node.js)
    `;
  }

  /**
   * Parse a DOCX file to extract text
   * @param {ArrayBuffer} fileContent - The DOCX file content
   * @returns {Promise<string>} - Extracted text
   * @private
   */
  async parseDocx(fileContent) {
    // In a real implementation, we would use mammoth.js to parse the DOCX
    // For now, we'll simulate DOCX parsing with a delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Return a simulated extracted text (same as PDF for simplicity)
    return `
JOHN DOE
Software Engineer
john.doe@example.com | (555) 123-4567 | New York, NY | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development, cloud technologies, and agile methodologies. Passionate about creating scalable, efficient solutions to complex problems.

EXPERIENCE
Senior Software Engineer
Tech Innovations Inc., New York, NY
January 2020 - Present
• Led development of a microservices architecture that improved system reliability by 35%
• Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 40%
• Mentored junior developers and conducted code reviews to ensure code quality
• Technologies: React, Node.js, TypeScript, AWS, Docker, Kubernetes

Software Engineer
Digital Solutions LLC, San Francisco, CA
June 2017 - December 2019
• Developed RESTful APIs for mobile and web applications
• Optimized database queries, resulting in 50% faster response times
• Collaborated with UX designers to implement responsive UI components
• Technologies: JavaScript, Express.js, MongoDB, Redis, Git

EDUCATION
Bachelor of Science in Computer Science
University of Technology, Boston, MA
2013 - 2017
• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development

SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java, SQL
• Frontend: React, Redux, HTML5, CSS3, SASS
• Backend: Node.js, Express, Django, Spring Boot
• Databases: MongoDB, PostgreSQL, MySQL, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform
• Tools: Git, JIRA, Confluence, Postman

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• MongoDB Certified Developer
• Certified Scrum Master (CSM)

PROJECTS
Personal Portfolio Website
• Designed and developed a responsive portfolio website using React and Gatsby
• Implemented a headless CMS for content management
• Deployed using Netlify with continuous deployment

Inventory Management System
• Built a full-stack inventory management system for small businesses
• Implemented user authentication, role-based access control, and real-time updates
• Technologies: MERN stack (MongoDB, Express, React, Node.js)
    `;
  }

  /**
   * Extract sections from resume text
   * @param {string} text - The extracted text from the resume
   * @returns {Promise<Object>} - Extracted sections
   * @private
   */
  async extractSections(text) {
    // In a real implementation, we would use regex or NLP to identify sections
    // For now, we'll extract sections based on common headers

    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();

    // Initialize sections object
    const sections = {
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: []
    };

    // Extract summary
    for (const header of this.sectionHeaders.summary) {
      const headerIndex = lowerText.indexOf(header.toLowerCase());
      if (headerIndex !== -1) {
        // Find the end of the summary (next section header or end of text)
        let endIndex = text.length;
        for (const sectionType in this.sectionHeaders) {
          if (sectionType === 'summary') continue;

          for (const sectionHeader of this.sectionHeaders[sectionType]) {
            const nextHeaderIndex = lowerText.indexOf(sectionHeader.toLowerCase(), headerIndex + header.length);
            if (nextHeaderIndex !== -1 && nextHeaderIndex < endIndex) {
              endIndex = nextHeaderIndex;
            }
          }
        }

        // Extract the summary text
        sections.summary = text.substring(headerIndex + header.length, endIndex).trim();
        break;
      }
    }

    // Extract skills
    const skillsHeader = this.findSectionHeader(lowerText, this.sectionHeaders.skills);
    if (skillsHeader) {
      const skillsStartIndex = lowerText.indexOf(skillsHeader.toLowerCase());
      let skillsEndIndex = text.length;

      // Find the end of the skills section
      for (const sectionType in this.sectionHeaders) {
        if (sectionType === 'skills') continue;

        for (const header of this.sectionHeaders[sectionType]) {
          const nextHeaderIndex = lowerText.indexOf(header.toLowerCase(), skillsStartIndex + skillsHeader.length);
          if (nextHeaderIndex !== -1 && nextHeaderIndex < skillsEndIndex) {
            skillsEndIndex = nextHeaderIndex;
          }
        }
      }

      // Extract skills text
      const skillsText = text.substring(skillsStartIndex + skillsHeader.length, skillsEndIndex).trim();

      // Parse skills (assuming bullet points or comma-separated)
      sections.skills = this.parseSkills(skillsText);
    }

    // For simplicity, we'll use the simulated data for other sections
    sections.experience = [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        location: 'New York, NY',
        startDate: 'January 2020',
        endDate: 'Present',
        description: 'Led development of microservices architecture, implemented CI/CD pipelines, mentored junior developers.'
      },
      {
        title: 'Software Engineer',
        company: 'Digital Solutions LLC',
        location: 'San Francisco, CA',
        startDate: 'June 2017',
        endDate: 'December 2019',
        description: 'Developed RESTful APIs, optimized database queries, collaborated with UX designers.'
      }
    ];

    sections.education = [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        location: 'Boston, MA',
        startDate: '2013',
        endDate: '2017',
        description: 'GPA: 3.8/4.0, Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development'
      }
    ];

    sections.certifications = [
      'AWS Certified Solutions Architect - Associate',
      'MongoDB Certified Developer',
      'Certified Scrum Master (CSM)'
    ];

    sections.projects = [
      {
        name: 'Personal Portfolio Website',
        description: 'Designed and developed a responsive portfolio website using React and Gatsby.'
      },
      {
        name: 'Inventory Management System',
        description: 'Built a full-stack inventory management system for small businesses using MERN stack.'
      }
    ];

    return sections;
  }

  /**
   * Find a section header in the text
   * @param {string} text - The text to search in
   * @param {Array<string>} headers - Possible headers to look for
   * @returns {string|null} - The found header or null
   * @private
   */
  findSectionHeader(text, headers) {
    for (const header of headers) {
      if (text.includes(header.toLowerCase())) {
        return header;
      }
    }
    return null;
  }

  /**
   * Parse skills from text
   * @param {string} text - The skills text
   * @returns {Array<string>} - Extracted skills
   * @private
   */
  parseSkills(text) {
    // Split by bullet points, commas, or new lines
    const skillsArray = text.split(/[•,\n]+/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    // If no skills found, return a default set
    if (skillsArray.length === 0) {
      return [
        'JavaScript',
        'TypeScript',
        'Python',
        'React',
        'Node.js',
        'AWS',
        'Docker'
      ];
    }

    return skillsArray;
  }

  /**
   * Extract contact information from resume text
   * @param {string} text - The resume text
   * @returns {Object} - Contact information
   * @private
   */
  extractContactInfo(text) {
    // In a real implementation, we would use regex to extract contact info
    // For now, we'll return simulated contact info

    // Extract name (usually at the top of the resume)
    const lines = text.trim().split('\n');
    const name = lines[0].trim();

    // Extract email using regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone using regex
    const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract location (city, state)
    const locationRegex = /([A-Za-z\s]+),\s*([A-Z]{2})/;
    const locationMatch = text.match(locationRegex);
    const location = locationMatch ? locationMatch[0] : '';

    return {
      name,
      email,
      phone,
      location
    };
  }

  /**
   * Get fallback sections for when parsing fails
   * @returns {Object} - Fallback sections
   * @private
   */
  getFallbackSections() {
    return {
      contact: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        location: 'New York, NY'
      },
      summary: 'Experienced software engineer with expertise in web development and cloud technologies.',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'New York, NY',
          startDate: '2020',
          endDate: 'Present',
          description: 'Developed web applications and APIs.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University',
          location: 'Boston, MA',
          startDate: '2016',
          endDate: '2020',
          description: ''
        }
      ],
      skills: [
        'JavaScript',
        'React',
        'Node.js',
        'Python',
        'AWS'
      ],
      certifications: [],
      projects: []
    };
  }

  /**
   * Extract keywords from a parsed resume
   * @param {Object} parsedResume - Parsed resume data
   * @returns {Array<string>} - Extracted keywords
   */
  extractKeywords(parsedResume) {
    const keywords = [];

    // Extract skills as keywords
    if (parsedResume.sections && parsedResume.sections.skills) {
      keywords.push(...parsedResume.sections.skills);
    }

    // Extract technologies from experience
    if (parsedResume.sections && parsedResume.sections.experience) {
      for (const exp of parsedResume.sections.experience) {
        if (exp.description) {
          // Look for technology keywords in description
          const techMatches = exp.description.match(/Technologies:\s*([^.]+)/i);
          if (techMatches && techMatches[1]) {
            const technologies = techMatches[1].split(',').map(tech => tech.trim());
            keywords.push(...technologies);
          }
        }
      }
    }

    // Extract certifications as keywords
    if (parsedResume.sections && parsedResume.sections.certifications) {
      keywords.push(...parsedResume.sections.certifications);
    }

    // Remove duplicates and filter out empty strings
    return [...new Set(keywords)].filter(keyword => keyword.length > 0);
  }

  /**
   * Match a job description against a parsed resume
   * @param {Object} parsedResume - Parsed resume data
   * @param {string} jobDescription - Job description text
   * @returns {Object} - Match results
   */
  matchJobDescription(parsedResume, jobDescription) {
    // Extract keywords from resume
    const resumeKeywords = this.extractKeywords(parsedResume);

    // Extract keywords from job description
    const jobKeywords = this.extractKeywordsFromText(jobDescription);

    // Find matching keywords
    const keywordMatches = [];
    const missingKeywords = [];

    for (const keyword of jobKeywords) {
      const found = resumeKeywords.some(resumeKeyword =>
        resumeKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(resumeKeyword.toLowerCase())
      );

      keywordMatches.push({ keyword, found });

      if (!found) {
        missingKeywords.push(keyword);
      }
    }

    // Calculate match percentage
    const matchCount = keywordMatches.filter(match => match.found).length;
    const overallMatch = jobKeywords.length > 0 ? matchCount / jobKeywords.length : 0;

    // Generate recommendations
    const recommendations = [];

    if (missingKeywords.length > 0) {
      recommendations.push(`Consider adding these keywords to your resume: ${missingKeywords.join(', ')}`);
    }

    if (overallMatch < 0.5) {
      recommendations.push('Your resume has a low match rate with this job description. Consider tailoring it more specifically to this role.');
    } else if (overallMatch >= 0.5 && overallMatch < 0.8) {
      recommendations.push('Your resume has a moderate match with this job description. Highlighting specific experiences related to the missing keywords could improve your chances.');
    } else {
      recommendations.push('Your resume has a strong match with this job description!');
    }

    return {
      overallMatch,
      keywordMatches,
      missingKeywords,
      recommendations
    };
  }

  /**
   * Extract keywords from text
   * @param {string} text - The text to extract keywords from
   * @returns {Array<string>} - Extracted keywords
   * @private
   */
  extractKeywordsFromText(text) {
    // In a real implementation, we would use NLP or keyword extraction algorithms
    // For now, we'll use a simple approach with common tech keywords

    const commonKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'Git', 'GitHub', 'GitLab',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
      'REST', 'GraphQL', 'API', 'Microservices', 'Serverless', 'Cloud', 'Web Services',
      'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'TDD', 'BDD', 'Unit Testing'
    ];

    // Find keywords in the text
    const foundKeywords = [];
    for (const keyword of commonKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }

    return foundKeywords;
  }
}

// Create a singleton instance
const resumeParser = new ResumeParser();

export default resumeParser;
