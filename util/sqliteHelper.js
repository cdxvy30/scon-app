import SqliteManager from '../services/SqliteManager';

export const hydrateUser = async user => {
  const {id} = user;
  if (!id) {
    return user;
  }

  const projects = await SqliteManager.getProjectsByUserId(id);
  const promises = projects.map(project => hydrateProject(project));
  const hydratedProjects = await Promise.all(promises);

  return {
    ...user,
    project: hydratedProjects,
  };
};

export const hydrateProject = async project => {
  const {id, user_id} = project;

  const user = user_id ? SqliteManager.getUser(user_id) : {};
  const issues = await SqliteManager.getIssuesByProjectId(id);
  const promises = issues.map(issue => hydrateIssue(issue));
  const hydratedIssues = await Promise.all(promises);

  const {user_id: _, ...projectProps} = project;
  return {
    ...projectProps,
    user,
    issue: hydratedIssues,
  };
};

export const hydrateIssue = async issue => {
  const {id, project_id} = issue;

  const project = project_id ? await SqliteManager.getProject(project_id) : {};
  const issueAttachments = await SqliteManager.getIssueAttachmentsByIssueId(id);
  const issueLabels = await SqliteManager.getIssueLabelsByIssueId(id);

  const {project_id: _, ...issueProps} = issue;
  return {
    ...issueProps,
    project,
    issue_attachment: issueAttachments,
    issue_label: issueLabels,
  };
};

export const transformProject = project => {
  return {
    id: project.id,
    title: project.name,
    thumbnail: project.image,
    status: project.status,
    timestamp: project.created_at,
  };
};

export const transformProjects = projects =>
  projects.map(project => transformProject(project));

  export const transformWorkItem = workitem => {
    return {
      id: workitem.id,
      name: workitem.name,
      manager: workitem.manager,
      phone_number: workitem.phone_number,
      company: workitem.company,
      project_id: workitem.project_id
    };
  };
  
  export const transformWorkItems = workitems =>
    workitems.map(workitem => transformWorkItem(workitem));

export const transformIssue = issue => {
  const objects = issue.issue_label.map(label => label.object);

  return {
    id: issue.id,
    title: issue.type,
    type: issue.type,
    type_remark: issue.type_remark,
    image: {
      uri: issue.image_uri,
      width: issue.image_width,
      height: issue.image_height,
    },
    status: issue.status,
    tracking: issue.tracking,
    location: issue.location,
    activity: issue.activity,
    assignee: issue.assignee,
    assignee_phone_number: issue.assignee_phone_number,
    safetyManager: issue.safety_manager,
    objects: [...new Set(objects)],
    attachments: issue.issue_attachment,
    labels: issue.issue_label,
    timestamp: new Date(issue.created_at).toISOString(),
  };
};

export const transformIssues = issues =>
  issues.map(issue => transformIssue(issue));

export const transformLabel = label => {
  return {
    key: label.id,
    box: {
      maxX: label.max_x,
      maxY: label.max_y,
      minX: label.min_x,
      minY: label.min_y,
    },
    mode: label.mode,
    name: label.name,
    path: label.path
  };
};

export const transformLabels = labels =>
  labels.map(label => transformLabel(label));

export const transformExportIssue = issue => {
  const {title, objects, ...issueRestProps} = issue;
  return {
    ...issueRestProps,
    image: {
      ...issue.image,
      uri: issue.image.uri.split('/').pop(),
    },
    attachments: issue.attachments.map(attachment => {
      const {issue_id, created_at, updated_at, ...attRestProps} = attachment;
      return {
        ...attRestProps,
        image: attachment.image.split('/').pop(),
        timestamp: created_at,
      };
    }),
    labels: issue.labels.map(label => {
      const {issue_id, created_at, ...labelRestProps} = label;
      return {
        ...labelRestProps,
        timestamp: created_at,
      };
    }),
  };
};

export const transformExportIssues = issues =>
  issues.map(issue => transformExportIssue(issue));