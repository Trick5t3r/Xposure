# Generated by Django 5.1.4 on 2025-01-31 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_basefile_date_basefile_region'),
    ]

    operations = [
        migrations.AlterField(
            model_name='basefile',
            name='region',
            field=models.CharField(blank=True, max_length=3, null=True),
        ),
    ]
