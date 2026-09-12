import prisma from "../lib/prisma.js";
import { CreateCandidateRequest } from "../model/dtos/CreateCandidateRequest.js";


export const createCandidate = async (data: CreateCandidateRequest) => {
  const candidate = await prisma.candidate.create({
    data: {
      name: data.name,
      yearsOfExperience: data.yearsOfExperience,
      location: data.location,
      expectedSalary: data.expectedSalary,

      skills: {
        create: data.skills.map((skill) => ({
          skill,
        })),
      },
    },

    // if not given then it return the model with the skills, it would just return the candidate model(but would create both skill and candidate though)
    include: {
      skills: true,
    },
  });

  return candidate;
};
