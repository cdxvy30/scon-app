import User from '../models/User';
import Project from '../models/Project';
import Issue from '../models/Issue';
import IssueAttachment from '../models/IssueAttachment';
import IssueLabel from '../models/IssueLabel';
import WorkItem from '../models/WorkItem';
import sampleData from '../data';
import {hydrateIssue, hydrateProject, hydrateUser} from '../util/sqliteHelper';


export default class SqliteManager {
  static dbInit = async () => {
    try {
      await User.createTable();
      await Project.createTable();
      await Issue.createTable();
      await IssueAttachment.createTable();
      await IssueLabel.createTable();
      await WorkItem.createTable();
      
      // await User.destroyAll();
      // await Project.destroyAll();
      // await Issue.destroyAll();
      // await IssueAttachment.destroyAll();
      // await IssueLabel.destroyAll();
      // await WorkItem.destroyAll();

      console.log('[Sqlite] Datebase initialization succeeded.');
    } catch (error) {
      console.log('[Sqlite] Datebase initialization failed.');
      console.log(error);
    }
  };

  static dbInitSampleData = async () => {
    try {
      // User
      const users = sampleData.user;
      const userPromises = users.map(user => this.createUser(user));
      await Promise.all(userPromises);
      const allUsers = await this.getAllUsers();

      // Project
      const projects = sampleData.project;
      const projectPromises = projects.map(project =>
        this.createProject({
          ...project,
          user_id: allUsers.find(u => u.name === users[project.user_id].name)
            .id,
        }),
      );
      await Promise.all(projectPromises);
      const allProjects = await this.getAllProjects();

      // Issue
      const issues = sampleData.issue;
      const issuePromises = issues.map(issue =>
        this.createIssue({
          ...issue,
          project_id: allProjects.find(
            p => p.name === projects[issue.project_id].name,
          ).id,
        }),
      );
      await Promise.all(issuePromises);
      const allIssues = await this.getAllIssues();

      // Issue attachment
      const issueAttachments = sampleData.issue_attachment;
      const issueAttachmentPromises = issueAttachments.map(issueAttachment =>
        this.createIssueAttachment({
          ...issueAttachment,
          issue_id: allIssues[issueAttachment.issue_id].id,
        }),
      );
      await Promise.all(issueAttachmentPromises);

      // Issue label
      const issueLabels = sampleData.issue_label;
      const issueLabelPromises = issueLabels.map(issueLabel =>
        this.createIssueLabel({
          ...issueLabel,
          issue_id: allIssues[issueLabel.issue_id].id,
        }),
      );
      await Promise.all(issueLabelPromises);

      // Work Item
      const workitems = sampleData.workitem;
      const workitemPromises = workitems.map(workitem =>
        this.createProject({
          ...workitem,
        }),
      );
      await Promise.all(workitemPromises);
      const allWorkItem = await this.getAllWorkItem();


      console.log('[Sqlite] Sample data import succeeded.');
    } catch (error) {
      console.log('[Sqlite] Sample data import failed.');
      console.log(error);
    }
  };

  static dbInitBasicData = async () => {
    try {
      // User
      const users = sampleData.user;
      const userPromises = users.map(user => this.createUser(user));
      await Promise.all(userPromises);

      console.log('[Sqlite] Basic data import succeeded.');
    } catch (error) {
      console.log('[Sqlite] Basic data import failed.');
      console.log(error);
    }
  };

  /* Base Functions */
  static createInstance = async (model, props, uniqueKeys) => {
    try {
      let errorMessage = '';
      const validationPromises = uniqueKeys.map(async key => {
        if (!props[key]) {
          errorMessage = `"${key}" must be provided.`;
        }
        const existingInstance = await this.getInstanceByProp(
          model,
          key,
          props[key],
        );
        if (existingInstance) {
          errorMessage = `"${key}" with value "${props[key]}" already exists.`;
        }
      });

      await Promise.all(validationPromises);

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      const newInstance = new model(props);
      await newInstance.save();
    } catch (error) {
      console.log('[Sqlite] Create instance failed.');
      console.log(error);
    }
  };

  static updateInstance = async (model, id, props, uniqueKeys) => {
    try {
      const existingInstance = await model.find(id);
      if (!existingInstance) {
        throw new Error(`Instance with id "${id}" not existed.`);
      }

      let errorMessage = '';
      const validationPromises = uniqueKeys.map(async key => {
        if (!props[key]) {
          return;
        }
        const existingByProps = await this.getInstanceByProp(
          model,
          key,
          props[key],
        );
        if (existingByProps.length > 1) {
          errorMessage = `"${key}" with value "${props[key]}" already exists.`;
        }
        if (existingByProps.length === 1 && existingByProps[0].id !== id) {
          errorMessage = `"${key}" with value "${props[key]}" already exists.`;
        }
      });

      await Promise.all(validationPromises);

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      Object.keys(props).map(key => {
        existingInstance[key] = props[key];
      });
      existingInstance.update_at = Date.now();

      await existingInstance.save();
    } catch (error) {
      console.log('[Sqlite] Update instance failed.');
      console.log(error);
    }
  };

  static deleteInstance = async (model, id) => {
    try {
      const existingInstance = await model.find(id);
      if (!existingInstance) {
        throw new Error(`Instance with id "${id}" not existed.`);
      }

      await model.destroy(id);
    } catch (error) {
      console.log('[Sqlite] Delete instance failed.');
      console.log(error);
    }
  };

  static deleteAllInstances = async model => {
    try {
      await model.destroyAll();
    } catch (error) {
      console.log('[Sqlite] Delete all instances failed.');
      console.log(error);
    }
  };

  static getInstances = model => model.query({});

  static getInstanceById = (model, id) => model.find(id);

  static getInstanceByProp = (model, name, value) =>
    model.findBy({[`${name}_eq`]: value});

  static getInstancesByProp = (model, name, value) =>
    model.query({
      where: {
        [`${name}_eq`]: value,
      },
    });
  /* ********************** */

  /* Basic Entity Functions */
  static createUser = props => this.createInstance(User, props, ['username']);
  static createProject = props => this.createInstance(Project, props, []);
  static createIssue = props => this.createInstance(Issue, props, []);
  static createIssueAttachment = props =>
    this.createInstance(IssueAttachment, props, []);
  static createIssueLabel = props => this.createInstance(IssueLabel, props, []);
  static createWorkItem = props => this.createInstance(WorkItem, props, []);

  static updateUser = (id, props) =>
    this.updateInstance(User, id, props, ['username']);
  static updateProject = (id, props) =>
    this.updateInstance(Project, id, props, []);
  static updateProjectStatus = (id, props) =>
    this.updateInstance(Project, id, props, ['status']);
  static updateIssue = (id, props) => 
    this.updateInstance(Issue, id, props, []);
  static updateIssueAttachment = (id, props) =>
    this.updateInstance(IssueAttachment, id, props, []);
  static updateIssueLabel = (id, props) =>
    this.updateInstance(IssueLabel, id, props, []);
  static updateWorkItem = (id, props) =>
    this.updateInstance(WorkItem, id, props, []);

  static deleteUser = id => this.deleteInstance(User, id);
  static deleteProject = async id => {
    await this.deleteInstance(Project, id);

    const issues = await this.getIssuesByProjectId(id);
    const issueDeletePromises = issues.map(issue =>
      this.deleteInstance(Issue, issue.id),
    );
    await Promise.all(issueDeletePromises);
  };
  static deleteIssue = async id => {
    await this.deleteInstance(Issue, id);

    const attachments = await this.getIssueAttachmentsByIssueId(id);
    const attachmentDeletePromises = attachments.map(attachment =>
      this.deleteInstance(IssueAttachment, attachment.id),
    );
    await Promise.all(attachmentDeletePromises);

    const labels = await this.getIssueLabelsByIssueId(id);
    const labelDeletePromises = labels.map(label =>
      this.deleteInstance(IssueLabel, label.id),
    );
    await Promise.all(labelDeletePromises);
  };
  static deleteIssueAttachment = id => this.deleteInstance(IssueAttachment, id);
  static deleteIssueLabel = id => this.deleteInstance(IssueLabel, id);

  static deleteAllUsers = () => this.deleteAllInstances(User);
  static deleteAllProjects = async () => {
    await this.deleteAllInstances(Project);
    await this.deleteAllIssues();
  };
  static deleteAllIssues = async () => {
    await this.deleteAllInstances(Issue);
    await this.deleteAllIssueAttachments();
    await this.deleteAllIssueLabels();
  };
  static deleteAllIssueAttachments = () =>
    this.deleteAllInstances(IssueAttachment);
  static deleteAllIssueLabels = () => this.deleteAllInstances(IssueLabel);

  static deleteWorkItem = async id => {
    await this.deleteInstance(WorkItem, id);

    const workitems = await this.getWorkItemByName(id);
    const workitemDeletePromises = workitems.map(workitem =>
      this.deleteInstance(WorkItem, workitem.name),
    );
    await Promise.all(workitemDeletePromises);
  };

  static getUser = id => this.getInstanceById(User, id);
  static getProject = id => this.getInstanceById(Project, id);
  static getIssue = id => this.getInstanceById(Issue, id);
  static getIssueAttachment = id => this.getInstanceById(IssueAttachment, id);
  static getIssueLabel = id => this.getInstanceById(IssueLabel, id);

  static getAllUsers = () => this.getInstances(User);
  static getAllProjects = () => this.getInstances(Project);
  static getAllIssues = () => this.getInstances(Issue);
  static getAllIssueAttachments = () => this.getInstances(IssueAttachment);
  static getAllIssueLabels = () => this.getInstances(IssueLabel);
  static getAllWorkItem = () => this.getInstances(WorkItem);
  /* ********************** */

  /* Advanced Entity Functions */
  static getHydratedUser = async id =>
    hydrateUser(await this.getInstanceById(User, id));
  static getHydratedProject = async id =>
    hydrateProject(await this.getInstanceById(Project, id));
  static getHydratedIssue = async id =>
    hydrateIssue(await this.getInstanceById(Issue, id));

  static getUserByName = username =>
    this.getInstanceByProp(User, 'username', username);
  static getProjectByName = name =>
    this.getInstanceByProp(Project, 'name', name);
  static getProjectsByUserId = userId =>
    this.getInstancesByProp(Project, 'user_id', userId);
  static getIssuesByProjectId = projectId =>
    this.getInstancesByProp(Issue, 'project_id', projectId);
  static getIssueAttachmentsByIssueId = issueId =>
    this.getInstancesByProp(IssueAttachment, 'issue_id', issueId);
  static getIssueLabelsByIssueId = issueId =>
    this.getInstancesByProp(IssueLabel, 'issue_id', issueId);
  static getWorkItemByName = name =>
    this.getInstancesByProp(WorkItem, 'name', name);
  /* ************************* */
}
