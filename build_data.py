import json, itertools
from pathlib import Path
p=Path(__file__).parent
A=['Atlético Aurena','Deportivo Puerto Bruma','Real Monteluz','Estrella de Miravia','Ferroviarios de Ferral','Titanes de Tarsena','Atlético Solverde','Independiente San Orio','Halcones de Venturia']
B=['Unión Popular Aurena','Sporting Bahía Clara','Deportivo Rocafría','Imperial Seravia','Atlético Laguna Roja','Deportivo Vallealto','Mineros de Carbalia','Academia Liria','Náutico Caldera']
S=['Juventud Miravia','Deportivo Riberalta','Atlético Bosqueceniza','Unión Costamar','Horizonte de Dunara','Rayo de Pinarés','Deportivo Nublar','Atlético San Talio','Lobos de Quintera','Fénix de Istral']
# h,a,home goals,away goals grouped per week
HA=[
 [('Halcones de Venturia','Atlético Aurena',2,1),('Deportivo Puerto Bruma','Independiente San Orio',1,1),('Titanes de Tarsena','Real Monteluz',0,2),('Estrella de Miravia','Atlético Solverde',3,2)],
 [('Halcones de Venturia','Ferroviarios de Ferral',0,2),('Titanes de Tarsena','Atlético Aurena',2,2),('Deportivo Puerto Bruma','Atlético Solverde',3,1),('Estrella de Miravia','Real Monteluz',1,2)],
 [('Ferroviarios de Ferral','Independiente San Orio',1,1),('Halcones de Venturia','Titanes de Tarsena',2,2),('Atlético Aurena','Estrella de Miravia',1,0),('Real Monteluz','Deportivo Puerto Bruma',2,1)],
 [('Titanes de Tarsena','Ferroviarios de Ferral',1,2),('Independiente San Orio','Atlético Solverde',2,0),('Estrella de Miravia','Halcones de Venturia',2,2),('Atlético Aurena','Deportivo Puerto Bruma',1,2)],
 [('Atlético Solverde','Ferroviarios de Ferral',2,2),('Titanes de Tarsena','Estrella de Miravia',1,3),('Real Monteluz','Independiente San Orio',0,1),('Deportivo Puerto Bruma','Halcones de Venturia',0,0)],
 [('Estrella de Miravia','Ferroviarios de Ferral',2,1),('Atlético Solverde','Real Monteluz',1,2),('Deportivo Puerto Bruma','Titanes de Tarsena',0,2),('Independiente San Orio','Atlético Aurena',1,0)],
]
HB=[
 [('Náutico Caldera','Unión Popular Aurena',0,0),('Sporting Bahía Clara','Academia Liria',1,2),('Deportivo Vallealto','Deportivo Rocafría',2,0),('Imperial Seravia','Atlético Laguna Roja',1,3)],
 [('Náutico Caldera','Mineros de Carbalia',2,1),('Deportivo Vallealto','Unión Popular Aurena',1,1),('Sporting Bahía Clara','Atlético Laguna Roja',2,0),('Imperial Seravia','Deportivo Rocafría',0,1)],
 [('Mineros de Carbalia','Academia Liria',1,0),('Náutico Caldera','Deportivo Vallealto',2,1),('Unión Popular Aurena','Imperial Seravia',1,0),('Deportivo Rocafría','Sporting Bahía Clara',1,3)],
 [('Deportivo Vallealto','Mineros de Carbalia',0,1),('Academia Liria','Atlético Laguna Roja',2,0),('Imperial Seravia','Náutico Caldera',2,2),('Unión Popular Aurena','Sporting Bahía Clara',0,1)],
 [('Atlético Laguna Roja','Mineros de Carbalia',3,2),('Deportivo Vallealto','Imperial Seravia',1,2),('Deportivo Rocafría','Academia Liria',1,1),('Sporting Bahía Clara','Náutico Caldera',2,2)],
 [('Mineros de Carbalia','Imperial Seravia',2,1),('Deportivo Rocafría','Atlético Laguna Roja',1,1),('Sporting Bahía Clara','Deportivo Vallealto',1,2),('Academia Liria','Unión Popular Aurena',1,1)],
]
HS=[
 [('Juventud Miravia','Fénix de Istral',0,1),('Lobos de Quintera','Deportivo Riberalta',2,2),('Atlético Bosqueceniza','Atlético San Talio',1,0),('Deportivo Nublar','Unión Costamar',2,1),('Horizonte de Dunara','Rayo de Pinarés',3,1)],
 [('Lobos de Quintera','Juventud Miravia',1,0),('Fénix de Istral','Atlético San Talio',2,2),('Deportivo Nublar','Deportivo Riberalta',0,2),('Atlético Bosqueceniza','Rayo de Pinarés',1,1),('Horizonte de Dunara','Unión Costamar',1,3)],
 [('Juventud Miravia','Atlético San Talio',2,3),('Lobos de Quintera','Deportivo Nublar',0,3),('Rayo de Pinarés','Fénix de Istral',3,0),('Deportivo Riberalta','Horizonte de Dunara',1,0),('Unión Costamar','Atlético Bosqueceniza',2,3)],
 [('Juventud Miravia','Deportivo Nublar',0,2),('Atlético San Talio','Rayo de Pinarés',2,1),('Horizonte de Dunara','Lobos de Quintera',1,1),('Fénix de Istral','Unión Costamar',2,0),('Atlético Bosqueceniza','Deportivo Riberalta',1,2)],
 [('Rayo de Pinarés','Juventud Miravia',2,1),('Deportivo Nublar','Horizonte de Dunara',1,0),('Atlético San Talio','Unión Costamar',0,0),('Lobos de Quintera','Atlético Bosqueceniza',1,2),('Deportivo Riberalta','Fénix de Istral',0,1)],
 [('Juventud Miravia','Horizonte de Dunara',1,2),('Unión Costamar','Rayo de Pinarés',2,2),('Deportivo Nublar','Atlético Bosqueceniza',0,1),('Deportivo Riberalta','Atlético San Talio',2,2),('Fénix de Istral','Lobos de Quintera',1,0)],
]
def canonical(a,b): return tuple(sorted((a,b)))
def solve(teams,rounds,rest_byes,forced={}):
    played={canonical(a,b) for rr in rounds for a,b,*_ in rr}
    allpairs=set(itertools.combinations(sorted(teams),2))
    missing=allpairs-played
    assert len(missing)==(len(teams)//2)*(9-len(rounds)) if len(teams)==10 else len(missing)==12
    N=9-len(rounds)
    def rec(left, rest_byes, seq):
        if not left:return seq if len(seq)==N else None
        rd=len(rounds)+len(seq)+1
        forced_pair=forced.get(rd)
        for bye in rest_byes if rest_byes else [None]:
            active=tuple(t for t in teams if t!=bye)
            if forced_pair and bye in forced_pair: continue
            def match(remainder,groups):
                if not remainder:
                    if forced_pair and canonical(*forced_pair) not in groups:return None
                    rem=left-set(groups)
                    return rec(rem,[b for b in rest_byes if b!=bye] if bye else [],seq+[(bye,groups)])
                a=remainder[0]
                for b in remainder[1:]:
                    pair=canonical(a,b)
                    if pair not in left:continue
                    found=match(tuple(x for x in remainder if x not in [a,b]),groups+[pair])
                    if found:return found
                return None
            out=match(active,[])
            if out:return out
        return None
    return rec(missing,rest_byes,[])
# choose byes A = Estrella Puerto Titanes, B = Sporting Vallealto Imperial
for label,teams,history,byes,forced in [('A',A,HA,['Estrella de Miravia','Deportivo Puerto Bruma','Titanes de Tarsena'],{7:('Ferroviarios de Ferral','Real Monteluz')}),('B',B,HB,['Sporting Bahía Clara','Deportivo Vallealto','Imperial Seravia'],{7:('Atlético Laguna Roja','Unión Popular Aurena')}),('S',S,HS,[],{})]:
  sol=solve(teams,history,byes,forced)
  if sol is None: raise Exception(f'Cannot complete {label} with requested fixtures')
  print(label,sol)
  for idx,(bye,groups) in enumerate(sol):
    new=[]
    for a,b in groups:
      # aim alternating venue based on last match played (if same home last -> away now)
      prior=[rrm for rr in history for rrm in rr if a in rrm[:2]]
      a_prev=prior[-1][0]==a if prior else False
      prevb=[rrm for rr in history for rrm in rr if b in rrm[:2]]
      b_prev=prevb[-1][0]==b if prevb else False
      if forced.get(7) and idx==0 and canonical(a,b)==canonical(*forced[7]):
        h,v=forced[7]
      else:
        h,v=(b,a) if a_prev and not b_prev else (a,b)
      new.append((h,v,None,None))
    history.append(new)

def mk_schedule(teams, rounds,div):
 out=[]
 for day,matches in enumerate(rounds,1):
  for ix,(h,a,gh,ga) in enumerate(matches):
   out.append(dict(id=f'{div}-{day}-{ix}',competition=div,round=day,home=h,away=a,scoreH=gh,scoreA=ga,played=gh is not None,legacy=gh is not None))
 return out
# A/B 9 preliminary rounds, 9 reversed rounds, interzonal 9+18
matches=[]
for label,rr in [('A',HA),('B',HB)]:
 for rd,fixtures in enumerate(rr,1):
  # compressed numbering 7 = intraround7, 8=intraround8, 8=intraround9
  pubrd=rd if rd<=8 else 8
  slot=1 if rd==9 else 0
  for i,(h,a,x,y) in enumerate(fixtures):
   matches.append(dict(id=f'LSV-{label}-{rd}-{i}',competition='LSV',group=label,round=pubrd,slot=slot,seq=rd,home=h,away=a,scoreH=x,scoreA=y,played=x is not None,legacy=x is not None))
 # reverse of 9 preliminary rounds, indexed 10..18 => pub 10..17 doubles
 for rd in range(1,10):
  seq=9+rd
  pubrd=seq if seq<=17 else 17
  slot=1 if seq==18 else 0
  for i,(h,a,*_) in enumerate(rr[rd-1]):
   matches.append(dict(id=f'LSV-{label}-{seq}-{i}',competition='LSV',group=label,round=pubrd,slot=slot,seq=seq,home=a,away=h,scoreH=None,scoreA=None,played=False,legacy=False))
# classic interzonal in 9,18 : paired A/B same order historic 7 + 2 new
classic=[(A[0],B[0]),(A[1],B[1]),(A[2],B[2]),(A[3],B[3]),(A[4],B[6]),(A[5],B[4]),(A[6],B[5]),(A[7],B[7]),(A[8],B[8])]
for rd in [9,18]:
 for i,(a,b) in enumerate(classic):
  h,v=(a,b) if rd==9 else (b,a)
  matches.append(dict(id=f'LSV-CL-{rd}-{i}',competition='LSV',group='I',round=rd,slot=0,seq=rd,home=h,away=v,scoreH=None,scoreA=None,played=False,legacy=False))
for rd,fixtures in enumerate(HS,1):
 for i,(h,a,gh,ga) in enumerate(fixtures):
  matches.append(dict(id=f'LPV-{rd}-{i}',competition='LPV',group='S',round=rd,slot=0,home=h,away=a,scoreH=gh,scoreA=ga,played=gh is not None,legacy=gh is not None))
for rd in range(1,10):
 for i,(h,a,*_) in enumerate(HS[rd-1]):
  matches.append(dict(id=f'LPV-{rd+9}-{i}',competition='LPV',group='S',round=rd+9,slot=0,home=a,away=h,scoreH=None,scoreA=None,played=False,legacy=False))
# verify uniqueness and bye counts, games count
for label,clubs,compet in [('A',A,'LSV'),('B',B,'LSV'),('S',S,'LPV')]:
 intra=[m for m in matches if m['competition']==compet and (m.get('group')==label)]
 assert len(intra)==(72 if label in ['A','B'] else 90)
 for club in clubs:
  mm=[m for m in intra if club in (m['home'],m['away'])]
  assert len(mm)==16 if label in ['A','B'] else len(mm)==18
  assert len([m for m in mm if m['home']==club])==8 if label in ['A','B'] else len([m for m in mm if m['home']==club])==9
  rivals={x['away'] if x['home']==club else x['home'] for x in mm}
  assert len(rivals)==len(clubs)-1
for rd in range(1,19):
 fmt=[m for m in matches if m['round']==rd and m['competition']=='LSV']
 assert len(fmt)== (9 if rd in [9,18] else 16 if rd in [8,17] else 8),(rd,len(fmt))
 assert len([m for m in matches if m['round']==rd and m['competition']=='LPV'])==5
print('LSV matches',sum(m['competition']=='LSV' for m in matches),'LPV',sum(m['competition']=='LPV' for m in matches))
(p/'fixtures.json').write_text(json.dumps(matches,ensure_ascii=False,indent=2),encoding='utf8')
