import prisma from "../lib/prisma.js";
import { CreateJobRequest } from "../model/dtos/CreateJobRequest.js";

export const createJob = async (data: CreateJobRequest) => {
  const job = await prisma.job.create({
    data: {
      title: data.title,
      minYearsExperience: data.minYearsExperience,
      location: data.location,
      salaryMin: data.salaryRange.min,
      salaryMax: data.salaryRange.max,
      remoteAllowed: data.remoteAllowed,

      requiredSkills: {
        create: data.requiredSkills.map((skill) => ({
          skill: skill.skill,
          type: skill.type,
        })),
      },
    },

    include: {
      requiredSkills: true,
    },
  });

  return job;
};
