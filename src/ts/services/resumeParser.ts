/**
 * ResumeParser - Comprehensive Resume Analysis and Extraction Service
 * Extracts structured data from PDF and DOCX resume files
 * Supports skills detection, contact extraction, experience parsing, and education analysis
 */

import type { DocumentContent, DocumentChunk, ExtractedEntity } from '../types/index';

// Skills database for intelligent detection
const TECHNICAL_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'PHP', 'Ruby', 'Scala', 'Perl', 'R', 'MATLAB', 'Objective-C', 'Dart', 'Lua', 'Haskell',
  
  // Web Technologies
  'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
  'Spring', 'Bootstrap', 'jQuery', 'SASS', 'SCSS', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js',
  
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB',
  'Cassandra', 'Neo4j', 'InfluxDB', 'Elasticsearch', 'Firebase', 'Supabase',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'Terraform', 'Ansible', 'Puppet', 'Chef', 'Vagrant', 'Nginx', 'Apache', 'Linux', 'Ubuntu',
  
  // Tools & Platforms
  'Git', 'SVN', 'JIRA', 'Confluence', 'Slack', 'Teams', 'Figma', 'Adobe XD', 'Sketch',
  'IntelliJ', 'VSCode', 'Eclipse', 'Xcode', 'Android Studio', 'Postman', 'Insomnia',
  
  // Mobile Development
  'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'iOS', 'Android', 'Swift UI',
  
  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
  'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI', 'D3.js', 'Plotly',
  
  // Testing
  'Jest', 'Mocha', 'Jasmine', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'TestNG',
  'PyTest', 'RSpec', 'PHPUnit', 'Karma', 'Protractor'
];

const SOFT_SKILLS = [
  'Leadership', 'Team Management', 'Project Management', 'Communication', 'Problem Solving',
  'Critical Thinking', 'Analytical Skills', 'Creativity', 'Innovation', 'Adaptability',
  'Time Management', 'Organization', 'Collaboration', 'Mentoring', 'Training',
  'Strategic Planning', 'Decision Making', 'Conflict Resolution', 'Negotiation',
  'Public Speaking', 'Presentation Skills', 'Customer Service', 'Sales', 'Marketing'
];

const CERTIFICATIONS = [
  'AWS Certified', 'Azure Certified', 'Google Cloud', 'PMP', 'Scrum Master', 'CISSP',
  'CISA', 'CISM', 'CompTIA', 'Cisco', 'Microsoft Certified', 'Oracle Certified',
  'Salesforce Certified', 'Six Sigma', 'ITIL', 'PMI', 'CPA', 'CFA', 'FRM'
];

interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

interface ExperienceEntry {
  company: string;
  position: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string;
  responsibilities: string[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  graduationDate?: string;
  gpa?: string;
}

interface ParsedResume {
  contact: ContactInfo;
  skills: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  experience: ExperienceEntry[];
  education: EducationEntry[];
  summary?: string;
  fullText: string;
  wordCount: number;
  extractionQuality: {
    contact: number;
    skills: number;
    experience: number;
    overall: number;
  };
}

export class ResumeParser {
  /**
   * Parse resume text and extract structured information
   */
  parseResume(text: string): ParsedResume {
    const cleanText = this.cleanText(text);
    
    const contact = this.extractContactInfo(cleanText);
    const skills = this.extractSkills(cleanText);
    const experience = this.extractExperience(cleanText);
    const education = this.extractEducation(cleanText);
    const summary = this.extractSummary(cleanText);
    
    const extractionQuality = this.calculateExtractionQuality(
      contact, skills, experience, education, cleanText
    );

    return {
      contact,
      skills,
      experience,
      education,
      summary,
      fullText: cleanText,
      wordCount: cleanText.split(/\s+/).length,
      extractionQuality
    };
  }

  /**
   * Clean and normalize text for processing
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract contact information using pattern matching
   */
  private extractContactInfo(text: string): ContactInfo {
    const contact: ContactInfo = {};

    // Email patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // Phone patterns (various formats)
    const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      contact.phone = phoneMatch[0].replace(/\D+/g, '').replace(/^1/, '');
    }

    // LinkedIn patterns
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9\-]+)/i;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // GitHub patterns
    const githubRegex = /(?:github\.com\/|github:\/\/)([a-zA-Z0-9\-]+)/i;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      contact.github = `https://github.com/${githubMatch[1]}`;
    }

    // Website patterns
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+\.[a-zA-Z]{2,})/g;
    const websiteMatches = text.match(websiteRegex);
    if (websiteMatches) {
      const websites = websiteMatches.filter(url => 
        !url.includes('linkedin.com') && 
        !url.includes('github.com') &&
        !url.includes('@')
      );
      if (websites.length > 0) {
        contact.website = websites[0].startsWith('http') ? websites[0] : `https://${websites[0]}`;
      }
    }

    return contact;
  }

  /**
   * Extract skills using intelligent pattern matching
   */
  private extractSkills(text: string): { technical: string[]; soft: string[]; certifications: string[] } {
    const foundTechnical = new Set<string>();
    const foundSoft = new Set<string>();
    const foundCertifications = new Set<string>();

    // Create case-insensitive search patterns
    const textLower = text.toLowerCase();

    // Find technical skills
    TECHNICAL_SKILLS.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (textLower.includes(skillLower)) {
        foundTechnical.add(skill);
      }
    });

    // Find soft skills
    SOFT_SKILLS.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (textLower.includes(skillLower)) {
        foundSoft.add(skill);
      }
    });

    // Find certifications
    CERTIFICATIONS.forEach(cert => {
      const certLower = cert.toLowerCase();
      if (textLower.includes(certLower)) {
        foundCertifications.add(cert);
      }
    });

    // Additional pattern-based extraction
    const skillSections = this.extractSkillSections(text);
    skillSections.forEach(section => {
      const words = section.split(/[,;|\n]+/).map(w => w.trim()).filter(w => w.length > 1);
      words.forEach(word => {
        if (word.length > 2 && word.length < 30) {
          // Heuristic: if it's in a skills section and looks technical, add it
          if (this.isTechnicalTerm(word)) {
            foundTechnical.add(word);
          }
        }
      });
    });

    return {
      technical: Array.from(foundTechnical).sort(),
      soft: Array.from(foundSoft).sort(),
      certifications: Array.from(foundCertifications).sort()
    };
  }

  /**
   * Extract skill sections from resume
   */
  private extractSkillSections(text: string): string[] {
    const sections: string[] = [];
    const skillHeaders = [
      'skills', 'technical skills', 'core competencies', 'technologies',
      'programming languages', 'software', 'tools', 'expertise'
    ];

    const lines = text.split('\n');
    let currentSection = '';
    let inSkillSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      // Check if this line is a skill header
      const isSkillHeader = skillHeaders.some(header => 
        line.includes(header) && line.length < 50
      );

      if (isSkillHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = '';
        inSkillSection = true;
        continue;
      }

      // Check if we've moved to a different section
      if (inSkillSection && line.length > 0 && !line.includes(',') && !line.includes('•')) {
        const isNewSection = [
          'experience', 'work history', 'employment', 'education',
          'projects', 'achievements', 'awards', 'certifications'
        ].some(header => line.includes(header));

        if (isNewSection) {
          if (currentSection) {
            sections.push(currentSection);
          }
          inSkillSection = false;
          currentSection = '';
          continue;
        }
      }

      if (inSkillSection) {
        currentSection += lines[i] + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Check if a term looks technical
   */
  private isTechnicalTerm(term: string): boolean {
    const techPatterns = [
      /\.(js|ts|py|java|cpp|cs|go|rs|swift|kt|php|rb)$/i,
      /^[A-Z]{2,6}$/,  // Acronyms like AWS, API, SQL
      /\d+\.\d+/,      // Version numbers
      /[A-Z][a-z]+[A-Z]/,  // CamelCase
    ];

    return techPatterns.some(pattern => pattern.test(term)) ||
           term.includes('.') || term.includes('#') || term.includes('+');
  }

  /**
   * Extract work experience
   */
  private extractExperience(text: string): ExperienceEntry[] {
    const experiences: ExperienceEntry[] = [];
    const experienceHeaders = [
      'experience', 'work experience', 'professional experience',
      'employment history', 'career history', 'work history'
    ];

    const sections = this.extractSectionsByHeaders(text, experienceHeaders);
    
    sections.forEach(section => {
      const entries = this.parseExperienceSection(section);
      experiences.push(...entries);
    });

    return experiences;
  }

  /**
   * Parse individual experience entries
   */
  private parseExperienceSection(section: string): ExperienceEntry[] {
    const entries: ExperienceEntry[] = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    let currentEntry: Partial<ExperienceEntry> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this looks like a job title/company line
      if (this.looksLikeJobTitle(trimmedLine)) {
        // Save previous entry
        if (currentEntry && currentEntry.company && currentEntry.position) {
          entries.push(currentEntry as ExperienceEntry);
        }
        
        // Start new entry
        currentEntry = this.parseJobTitleLine(trimmedLine);
      } else if (currentEntry) {
        // Check if this is a date line
        const dateInfo = this.extractDates(trimmedLine);
        if (dateInfo.startDate || dateInfo.endDate) {
          currentEntry.startDate = dateInfo.startDate;
          currentEntry.endDate = dateInfo.endDate;
          currentEntry.duration = trimmedLine;
        } else {
          // Add to description
          if (!currentEntry.description) {
            currentEntry.description = '';
          }
          currentEntry.description += trimmedLine + '\n';
          
          // Parse responsibilities
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            if (!currentEntry.responsibilities) {
              currentEntry.responsibilities = [];
            }
            currentEntry.responsibilities.push(trimmedLine.substring(1).trim());
          }
        }
      }
    }
    
    // Add final entry
    if (currentEntry && currentEntry.company && currentEntry.position) {
      entries.push(currentEntry as ExperienceEntry);
    }
    
    return entries;
  }

  /**
   * Check if a line looks like a job title
   */
  private looksLikeJobTitle(line: string): boolean {
    const jobTitlePatterns = [
      /\b(developer|engineer|manager|analyst|specialist|coordinator|assistant|director|lead|senior|junior)\b/i,
      /\b(software|web|mobile|full.?stack|front.?end|back.?end|data|product|project)\b/i,
      /\bat\s+\w+/i,  // "at Company"
      /\w+\s*[-–—]\s*\w+/,  // "Company - Position"
    ];
    
    return jobTitlePatterns.some(pattern => pattern.test(line)) && line.length < 100;
  }

  /**
   * Parse job title line to extract company and position
   */
  private parseJobTitleLine(line: string): Partial<ExperienceEntry> {
    // Try different patterns
    const patterns = [
      /^(.+?)\s+at\s+(.+)$/i,  // "Position at Company"
      /^(.+?)\s*[-–—]\s*(.+)$/,  // "Company - Position" or "Position - Company"
      /^(.+?),\s*(.+)$/,  // "Position, Company"
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, part1, part2] = match;
        
        // Heuristic: shorter part is usually the position, longer is company
        if (part1.length < part2.length) {
          return { position: part1.trim(), company: part2.trim() };
        } else {
          return { company: part1.trim(), position: part2.trim() };
        }
      }
    }
    
    // Fallback: assume entire line is position
    return { position: line.trim(), company: 'Unknown' };
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): { startDate?: string; endDate?: string } {
    const datePatterns = [
      /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)/i,
      /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/i,
      /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i,
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          startDate: match[1],
          endDate: match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' 
            ? 'Present' : match[2]
        };
      }
    }
    
    return {};
  }

  /**
   * Extract education information
   */
  private extractEducation(text: string): EducationEntry[] {
    const educationHeaders = ['education', 'academic background', 'qualifications'];
    const sections = this.extractSectionsByHeaders(text, educationHeaders);
    
    const education: EducationEntry[] = [];
    
    sections.forEach(section => {
      const entries = this.parseEducationSection(section);
      education.push(...entries);
    });
    
    return education;
  }

  /**
   * Parse education section
   */
  private parseEducationSection(section: string): EducationEntry[] {
    const entries: EducationEntry[] = [];
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for degree patterns
      const degreeMatch = trimmedLine.match(/(bachelor|master|phd|doctorate|associate|certificate|diploma).+?(?:in|of)\s+(.+?)(?:from|at)\s+(.+)/i);
      if (degreeMatch) {
        entries.push({
          degree: degreeMatch[1],
          field: degreeMatch[2],
          institution: degreeMatch[3],
        });
      }
    }
    
    return entries;
  }

  /**
   * Extract summary/objective section
   */
  private extractSummary(text: string): string | undefined {
    const summaryHeaders = [
      'summary', 'objective', 'profile', 'about', 'overview',
      'professional summary', 'career objective'
    ];
    
    const sections = this.extractSectionsByHeaders(text, summaryHeaders);
    return sections.length > 0 ? sections[0].substring(0, 500) : undefined;
  }

  /**
   * Extract sections by headers
   */
  private extractSectionsByHeaders(text: string, headers: string[]): string[] {
    const sections: string[] = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (headers.some(header => line.includes(header) && line.length < 50)) {
        let section = '';
        let j = i + 1;
        
        // Extract until next major section or end
        while (j < lines.length) {
          const nextLine = lines[j].trim().toLowerCase();
          
          // Check if we hit another major section
          const isNewSection = [
            'experience', 'education', 'skills', 'projects',
            'achievements', 'awards', 'certifications', 'references'
          ].some(header => nextLine.includes(header) && nextLine.length < 50);
          
          if (isNewSection) break;
          
          section += lines[j] + '\n';
          j++;
        }
        
        if (section.trim().length > 0) {
          sections.push(section.trim());
        }
      }
    }
    
    return sections;
  }

  /**
   * Calculate extraction quality scores
   */
  private calculateExtractionQuality(
    contact: ContactInfo,
    skills: { technical: string[]; soft: string[]; certifications: string[] },
    experience: ExperienceEntry[],
    education: EducationEntry[],
    text: string
  ): { contact: number; skills: number; experience: number; overall: number } {
    // Contact score (0-5)
    let contactScore = 0;
    if (contact.email) contactScore += 2;
    if (contact.phone) contactScore += 1;
    if (contact.linkedin) contactScore += 1;
    if (contact.github) contactScore += 1;
    contactScore = Math.min(contactScore, 5);

    // Skills score (0-5)
    const totalSkills = skills.technical.length + skills.soft.length + skills.certifications.length;
    const skillsScore = Math.min(Math.round(totalSkills / 5), 5);

    // Experience score (0-5)
    const experienceScore = Math.min(experience.length * 2, 5);

    // Overall score
    const overallScore = Math.round((contactScore + skillsScore + experienceScore) / 3);

    return {
      contact: contactScore,
      skills: skillsScore,
      experience: experienceScore,
      overall: overallScore
    };
  }

  /**
   * Convert parsed resume to DocumentContent format
   */
  toDocumentContent(parsed: ParsedResume, metadata: any): DocumentContent {
    const chunks: DocumentChunk[] = [
      {
        id: crypto.randomUUID(),
        content: parsed.summary || '',
        startIndex: 0,
        endIndex: parsed.summary?.length || 0,
        metadata: { section: 'summary' }
      },
      {
        id: crypto.randomUUID(),
        content: parsed.skills.technical.join(', '),
        startIndex: 0,
        endIndex: parsed.skills.technical.join(', ').length,
        metadata: { section: 'skills' }
      },
      {
        id: crypto.randomUUID(),
        content: parsed.experience.map(exp => 
          `${exp.position} at ${exp.company}: ${exp.description}`
        ).join('\n\n'),
        startIndex: 0,
        endIndex: parsed.experience.map(exp => `${exp.position} at ${exp.company}: ${exp.description}`).join('\n\n').length,
        metadata: { section: 'experience' }
      }
    ];

    const entities: ExtractedEntity[] = [
      ...parsed.skills.technical.map(skill => ({
        text: skill,
        type: 'skill' as const,
        confidence: 0.9,
        startIndex: 0,
        endIndex: skill.length,
        context: 'Technical skill'
      })),
      ...(parsed.contact.email ? [{
        text: parsed.contact.email,
        type: 'person' as const,
        confidence: 0.95,
        startIndex: 0,
        endIndex: parsed.contact.email.length,
        context: 'contact_info'
      }] : []),
      ...(parsed.contact.phone ? [{
        text: parsed.contact.phone,
        type: 'person' as const,
        confidence: 0.9,
        startIndex: 0,
        endIndex: parsed.contact.phone.length,
        context: 'contact_info'
      }] : []),
      ...(parsed.contact.linkedin ? [{
        text: parsed.contact.linkedin,
        type: 'person' as const,
        confidence: 0.9,
        startIndex: 0,
        endIndex: parsed.contact.linkedin.length,
        context: 'contact_info'
      }] : []),
      ...(parsed.contact.github ? [{
        text: parsed.contact.github,
        type: 'person' as const,
        confidence: 0.9,
        startIndex: 0,
        endIndex: parsed.contact.github.length,
        context: 'contact_info'
      }] : []),
      ...(parsed.contact.website ? [{
        text: parsed.contact.website,
        type: 'person' as const,
        confidence: 0.9,
        startIndex: 0,
        endIndex: parsed.contact.website.length,
        context: 'contact_info'
      }] : [])
    ];

    return {
      id: metadata.id,
      text: parsed.fullText,
      chunks,
      entities,
      summary: parsed.summary || `Resume with ${parsed.skills.technical.length} technical skills and ${parsed.experience.length} work experiences`,
      keyPoints: [
        ...parsed.skills.technical.slice(0, 10),
        ...parsed.experience.map(exp => `${exp.position} at ${exp.company}`).slice(0, 3)
      ],
      keywords: parsed.skills.technical,
      structuredData: parsed,
      processedAt: new Date(),
      metadata: {
        ...metadata,
        extractionQuality: parsed.extractionQuality,
        wordCount: parsed.wordCount,
        contactInfo: parsed.contact,
        skillsCount: parsed.skills.technical.length + parsed.skills.soft.length
      }
    };
  }
} 