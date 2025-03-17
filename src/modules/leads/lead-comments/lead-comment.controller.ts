import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  InternalServerErrorException,
  Patch,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { ILeadComment } from '@interface/leads/leads';
import { LeadCommentsDatabaseService } from './lead-comment.database.service';
import { Types } from 'mongoose';
import { LeadCommentsService } from './lead-comments.service';

@ApiTags('lead-comments')
@Controller({ path: 'lead-comments' })
export class LeadCommentController {
  constructor(
    private readonly leadCommentsDatabaseService: LeadCommentsDatabaseService,
    private readonly leadCommentsService: LeadCommentsService,
  ) {}

  @ApiOperation({
    summary: 'Get all lead comments with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Post('comments')
  async filterLeadComments(@Body() queryParams: any) {
    const filters = this.leadCommentsService.getLeadCommentFilters(queryParams);

    const foundComments =
      await this.leadCommentsDatabaseService.filterDocumentsWithPagination(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
      );

    return foundComments;
  }

  @ApiOperation({
    summary: 'Get lead comment export as csv downloadable link',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @LogRequest('lead-comments -> exportLeadComments')
  @Post('export')
  async exportLeadComments(@Body() queryParams: any) {
    const filters = this.leadCommentsService.getLeadCommentFilters(queryParams);

    const foundComments =
      await this.leadCommentsDatabaseService.filterLeadCommentsWithName(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
        true,
      );

    const downloadUrl =
      await this.leadCommentsService.exportCommentsAsCSV(foundComments);

    if (!downloadUrl)
      throw new InternalServerErrorException([
        RESPONSE_MESSAGES.CSV_GENERATE_ERROR,
      ]);

    return {
      data: {
        download_url: downloadUrl,
      },
    };
  }

  @ApiOperation({ summary: 'Create new lead comment' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @LogRequest('lead-comments -> createLeadComment')
  @Post()
  async createLeadComment(
    @Body() createComment: ILeadComment,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const newLeadComment =
      await this.leadCommentsDatabaseService.createNewLeadComment(
        createComment,
        loggedUser,
      );

    if (!newLeadComment)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newLeadComment };
  }

  @ApiOperation({ summary: 'Delete bulk Lead comment' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @LogRequest('lead-comments -> deleteBulkLeadComment')
  @Patch('delete-bulk')
  async deleteBulkLeadComment(@Body() body: { commentIds: string[] }) {
    const objectIds = body.commentIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length !== body.commentIds.length) {
      throw new UnprocessableEntityException(RESPONSE_MESSAGES.INVALID_PAYLOAD);
    }

    const deleteDone =
      await this.leadCommentsDatabaseService.bulkHardDelete(objectIds);

    if (!deleteDone)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: 'Lead comment deleted successfully' };
  }

  @ApiOperation({
    summary: 'Get all lead comments with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Get('last-comment/:id')
  async getLastComment(@Param() pathParams: ObjectIDPathDTO) {
    const lastComment = await this.leadCommentsDatabaseService.findDocument(
      { lead_id: new Types.ObjectId(pathParams.id) },
      {
        sort: { created_on: -1 }, // Sort by creation date in descending order
      },
    );

    return {
      data: {
        last_comment: lastComment?.comment ?? null,
      },
    };
  }

  @ApiOperation({
    summary: 'Get comments related to a lead by lead _id',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Get('last-comment-by/:id')
  async getLastCommentedPerson(@Param() pathParams: ObjectIDPathDTO) {
    const lastCommentBy =
      await this.leadCommentsDatabaseService.findLastCommentByUserName(
        pathParams.id,
      );

    return { data: lastCommentBy };
  }

  @ApiOperation({
    summary: 'Get all lead comments with added by',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Get('added-by/:id')
  async filterLeadCommentsWithAddedBy(@Param() pathParams: ObjectIDPathDTO) {
    const filters = this.leadCommentsService.getLeadCommentFilters({
      lead_id: new Types.ObjectId(pathParams.id),
    });
    const foundComments =
      await this.leadCommentsDatabaseService.filterLeadCommentsWithName(
        filters,
      );

    return { data: foundComments };
  }

  @ApiOperation({
    summary: 'Get comments related to a lead by lead _id',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Get(':id')
  async getCommentsForLead(@Param() pathParams: ObjectIDPathDTO) {
    const foundLeadComment =
      await this.leadCommentsDatabaseService.filterDocuments({
        lead_id: new Types.ObjectId(pathParams.id),
      });

    return { data: foundLeadComment };
  }

  @ApiOperation({ summary: 'Delete Lead comment' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @LogRequest('lead-comments -> deleteLeadComment')
  @Patch('delete/:id')
  async deleteLeadComment(@Param() pathParams: ObjectIDPathDTO) {
    const deleteDone = await this.leadCommentsDatabaseService.hardDelete(
      pathParams.id,
    );

    if (!deleteDone)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: 'Lead comment deleted successfully' };
  }

  @ApiOperation({ summary: 'Update Lead comment' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @LogRequest('lead-comments -> updateLeadComment')
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Patch(':id')
  async updateLeadComment(
    @LoggedUser() LoggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateCommentData: Partial<ILeadComment>,
  ) {
    const updatedComment =
      await this.leadCommentsDatabaseService.findLeadCommentByIdAndUpdate(
        pathParams.id,
        updateCommentData,
        LoggedUser,
      );

    if (!updatedComment)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedComment };
  }
}
