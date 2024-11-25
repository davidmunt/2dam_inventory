import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UtilsService } from '../utils/utils.service';
import { Classroom } from './classroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { Inventari } from 'src/inventari/inventari.entity';

@Injectable()
export class ClassroomService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    @InjectRepository(Inventari)
    private inventariRepository: Repository<Inventari>,  
  ) {}

  async obtenerDispositivosPorClase(classroomId: number): Promise<any> {
    const Conteo = await this.classroomRepository
      .createQueryBuilder('classroom')
      .leftJoinAndSelect('classroom.fk_inventari', 'inventari')
      .leftJoinAndSelect('inventari.fk_inventary_type', 'type')
      .select('type.description', 'deviceType')                                
      .addSelect('COUNT(inventari.id_inventory)', 'ConteoDispositivos')     
      .addSelect('classroom.id_classroom','Num_Aula')   
      .where('classroom.id_classroom = :classroomId', { classroomId })  
      .groupBy('type.description')                                             
      .getRawMany();                                                   
  
    return Conteo;
  }
  
  
  async getAllClassroom(xml?: string): Promise<Classroom[] | string> {
    const classrooms = await this.classroomRepository.find();

    if (xml === 'true') {
      const jsonformatted = JSON.stringify({ Classrooms: classrooms });
      return this.utilsService.convertJSONtoXML(jsonformatted);
    }

    return classrooms;
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
  ): Promise<{ message: string }> {
    const classroom = this.classroomRepository.create(createClassroomDto);
    await this.classroomRepository.save(classroom);
    return { message: 'Aula creada' };
  }

  async getClassroom(id: number, xml?: string): Promise<Classroom | string> {
    const classroom = await this.classroomRepository.findOneBy({
      id_classroom: id,
    });

    if (!classroom) {
      throw new HttpException('Classroom not found', HttpStatus.NOT_FOUND);
    }

    if (xml === 'true') {
      const jsonformatted = JSON.stringify(classroom);
      return this.utilsService.convertJSONtoXML(jsonformatted);
    }

    return classroom;
  }

  async updateClassroom(
    id: number,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOneBy({
      id_classroom: id,
    });

    if (!classroom) {
      throw new HttpException('Classroom not found', HttpStatus.NOT_FOUND);
    }

    const updatedClassroom = this.classroomRepository.merge(
      classroom,
      updateClassroomDto,
    );
    return this.classroomRepository.save(updatedClassroom);
  }

  async deleteClassroom(id: number): Promise<{ message: string }> {
    const result = await this.classroomRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Classroom not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Aula eliminada' };
  }
}
