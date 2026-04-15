import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'phone', type: 'text', unique: true, nullable: true })
  phone!: string | null;

  @Column({ name: 'full_name', type: 'text', nullable: true })
  fullName!: string | null;

  // Matches the "Painter" label in profile screen.
  @Column({ type: 'text', nullable: true })
  profession!: string | null;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress!: string | null;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'pin_hash', type: 'text', nullable: true })
  pinHash!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'loyalty_points', type: 'integer', default: 0 })
  loyaltyPoints!: number;

  @ManyToMany(() => Role, (role) => role.users, { cascade: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
