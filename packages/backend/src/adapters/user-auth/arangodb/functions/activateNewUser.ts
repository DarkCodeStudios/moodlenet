import { Role } from '@moodlenet/common/lib/graphql/types.graphql.gen'
import { aqlstr } from '../../../../lib/helpers/arango'
import { USER, UserStatus } from '../types'
import { isUsernameInUseQ } from './isUsernameInUse'

export const activateNewUserQ = ({
  token,
  password,
  username,
}: {
  token: string
  username: string
  password: string
}) => {
  const userRole: Role = 'User'
  return `
  
  LET usernameInUse = (${isUsernameInUseQ({ username })})[0]
  
  FOR user IN ${USER}
    
    FILTER !usernameInUse 
      && user.firstActivationToken == ${aqlstr(token)}
      && user.status == ${aqlstr(UserStatus.WaitingFirstActivation)}
    
    LIMIT 1
      
    UPDATE user WITH {
      updatedAt: DATE_NOW(),
      password: ${aqlstr(password)},
      username: ${aqlstr(username)},
      status: ${aqlstr(UserStatus.Active)},
      changeEmailRequest: null,
      role: ${aqlstr(userRole)},
    } IN ${USER}
    RETURN NEW
  `
}