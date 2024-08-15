"""Initial migration.

Revision ID: 63030322dce6
Revises: 
Create Date: 2024-08-15 22:11:05.687484

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '63030322dce6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('paper',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('author', sa.String(length=255), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('paper')
    # ### end Alembic commands ###
